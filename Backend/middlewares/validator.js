require("dotenv").config();
const joi = require("joi");

exports.registerSchema = joi.object({
  email: joi
    .string()
    .required()
    .min(5)
    .max(50)
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: joi
    .string()
    .required()
    .min(6)
    .max(60)
    .pattern(new RegExp(process.env.PASSWORD_REGEX)),
});

exports.loginSchema = joi.object({
  email: joi
    .string()
    .required()
    .min(5)
    .max(50)
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: joi
    .string()
    .required()
    .min(6)
    .max(60)
    .pattern(new RegExp(process.env.PASSWORD_REGEX)),
});

exports.acceptCodeSchema = joi.object({
  email: joi
    .string()
    .required()
    .min(6)
    .max(60)
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: joi.number().required(),
});
