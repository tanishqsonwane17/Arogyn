const { hash, compare } = require("bcryptjs");
const { createHmac } = require("crypto");

// Function to hash the password
exports.doHash = async (value, saltValue) => {
  console.log(`Hashing value with salt: ${saltValue}`);
  const result = await hash(value, parseInt(saltValue, 10)); // Parse saltValue as an integer
  return result;
};

// Function to compare the password
exports.doHashValidation = (value, hashedValue) => {
  const result = compare(value, hashedValue);
  return result;
};

// Function to hash the password using HMAC
exports.hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
