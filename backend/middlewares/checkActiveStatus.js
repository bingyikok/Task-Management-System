const connection = require("../config/database");

exports.checkActiveStatus = async (req, res, next) => {
  const username = req.username;
  const queryUserActiveStatus =
    "SELECT isActive FROM accounts WHERE username = ?";

  try {
    const [userActiveStatus] = await connection.query(queryUserActiveStatus, [
      username,
    ]);

    if (userActiveStatus[0].isActive === 0) {
      return res.status(403).json({
        success: false,
        message: "Error: Account disabled",
      });
    }
    next();
  } catch (error) {
    console.error(`Error while loading session of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while loading session of ${username}'s.`);
  }
};