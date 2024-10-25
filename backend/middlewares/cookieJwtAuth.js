const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config/config.env" });

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token; //Get token from cookies
  const ipAddress = req.ip;
  const browserInfo = req.headers["user-agent"];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token access",
    });
  } else
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.ip !== ipAddress || decoded.browser !== browserInfo) {
        return res.status(401).json({ message: "Token origin mismatch" });
      }
      req.username = decoded.username; //Add decoded username to request
      next(); //Proceed to route handler
    } catch (error) {
      res.clearCookie("token");
      console.error("Invalid/expired token: ", error);

      return res.status(401).json({
        success: false,
        message: "Invalid/expired token.",
      });
    }
};
