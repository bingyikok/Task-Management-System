const connection = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config/config.env" });

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const queryExistingUserAccount = "SELECT * FROM accounts WHERE username = ?";

  const ipAddress =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress; // Get upAddress
  const browserInfo = req.headers["user-agent"]; // Get browser details

  try {
    // Get user info
    const [existingUserAccount] = await connection.query(
      queryExistingUserAccount,
      [username]
    );

    // Check if the username exists
    if (existingUserAccount.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invaid credentials",
      });
    }

    // Check for active status
    if (!existingUserAccount[0].isActive) {
      return res.status(401).json({
        success: false,
        message: "User disabled",
      });
    }

    // Compare password (bcrypt for security)
    const isMatch = await bcrypt.compare(
      password,
      existingUserAccount[0].password
    );
    console.log(username)
    // If login is successful
    if (password === existingUserAccount[0].password || isMatch) {
      const token = jwt.sign(
        {
          username: username,
          ip: ipAddress,
          browser: browserInfo,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_TIME,
        }
      );

      res.cookie("token", token, {
        username: username,
        httpOnly: true,
        secure: true, // Developing in https
        sameSite: "None", // For cross-origin requests
        expires: new Date(
          Date.now() + process.env.TOKEN_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
      });

      return res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
      });
    }

    // If login is unsuccessful
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    // Handle any errors during the query or login process
    console.error("Error while logging in:", error);
    return res
      .status(500)
      .send("An error occurred while processing the login request.");
  }
};

exports.logout = async(req, res) => {
  res.clearCookie("token");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}