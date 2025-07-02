const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODE_CODE_SENDER_EMAIL, // generated ethereal user
    pass: process.env.NODE_CODE_SENDER_PASSWORD, // generated ethereal password
  },
});

module.exports = transport;
