const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: [true, "This email is already taken."],
      trim: true,
      minlength: [5, "Email must be atleast 6 characters long."],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      select: false, //This is a security measure to ensure that the password is not sent to the client.
      trim: true,
      minlength: [6, "Password must be atleast 6 characters long."],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: true,
    },
    verificationCodeValidation: {
      type: Number,
      select: true,
    },
    forgotPasswordCode: {
      type: String,
      select: true, // Corrected the typo from 'Select' to 'select'
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
