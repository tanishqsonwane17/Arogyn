require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  registerSchema,
  loginSchema,
  acceptCodeSchema,
} = require("../middlewares/validator");
const usersModel = require("../models/usersModel");
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const User = require("../models/usersModel");
const transport = require("../middlewares/sendMail");

exports.Register = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Registering user with email: ${email}`);
    const { error, value } = await registerSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User already exists!" });
    }

    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;
    res
      .status(201)
      .json({ success: true, message: "User created successfully", result });
  } catch (error) {
    console.log(error);
  }
};

exports.Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = await loginSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await usersModel
      .findOne({ email })
      .select("+password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }
    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "12h" }
    );
    res.json({ success: true, token, message: "User logged in successfully" });
  } catch (error) {
    console.log(error);
  }
};

exports.Logout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist!" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified!" });
    }
    const codeValue = Math.floor(Math.random() * 1000000).toString();
    let info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDER_EMAIL,
      to: existingUser.email,
      subject: "Verification Code",
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h1 style="font-size: 24px;">Verification Code</h1>
        <p style="font-size: 18px;">Your email is verified!</p>
        <p style="font-size: 18px;">Your verification code is:</p>
        <h1 background-color: rgb(34, 34, 34); font-size: 32px; color:rgb(169, 215, 220);">${codeValue}</h1>
      </div>
    `,
    });
    if (info.accepted[0] === existingUser.email) {
      console.log("Email sent: " + info.response);

      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );
      existingUser.verificationCode = hashedCodeValue;
      existingUser.verificationCodeValidation = Date.now();
      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "Verification code sent successfully!",
      });
    }
    res
      .status(400)
      .json({ success: false, message: "Failed to send verification code!" });
  } catch (error) {
    console.log(error);
  }
};

exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    console.log(`Verifying code for email: ${email}`);
    const { error, value } = await acceptCodeSchema.validate({
      email,
      providedCode,
    });
    if (error) {
      console.log(`Validation error: ${error.details[0].message}`);
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      console.log("User not found or invalid verification code");
      return res
        .status(401)
        .json({ success: false, message: "Invalid verification code!" });
    }
    if (existingUser.verified) {
      console.log("User already verified");
      return res
        .status(400)
        .json({ success: false, message: "User already verified!" });
    }
    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      console.log("No verification code found");
      return res
        .status(400)
        .json({ success: false, message: "No verification code found!" });
    }
    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      console.log("Verification code expired");
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired!" });
    }
    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );
    if (hashedCodeValue === existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      console.log("User verified successfully");
      return res
        .status(200)
        .json({ success: true, message: "User verified successfully!" });
    }
    console.log("Invalid verification code");
    return res.status(400).json({
      success: false,
      message: "unexpected problem occured please try again later!",
    });
  } catch (error) {
    console.log(`Server error: ${error}`);
    return res.status(500).json({ success: false, message: "Server error!" });
  }
};
