const connection = require("../config/database");

async function checkGroup(username, groupname) {
  const queryCheckGroup =
    "SELECT COUNT(*) AS count FROM user_groups WHERE username = ? AND groupname = ?";
  try {
    const [[userIsInGroup]] = await connection.query(queryCheckGroup, [
      username,
      groupname,
    ]);
    return userIsInGroup.count > 0;
  } catch (error) {
    throw new Error(`${username} cannot be found under ${groupname}.`);
  }
}

exports.checkIsAdmin = async (req, res, next) => {
  const username = req.username;

  try {
    const isAdmin = await checkGroup(username, "ADMIN");
    console.log(username, isAdmin);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Error: No longer admin",
        fields: {
          username: "Error: No longer admin",
          password: "Error: No longer admin",
          email: "Error: No longer admin",
          isActive: "Error: No longer admin",
          groupname: "Error: No longer admin",
        },
      });
    }
    next();
  } catch (error) {
    res
      .status(500)
      .send(`An error occurred while loading checking group of ${username}.`, error.message);
  }
};

exports.checkAccount = async (req, res) => {
  const username = req.username;
  const queryExistingUserAccount =
    "SELECT email, isActive FROM accounts WHERE username = ?";

  try {
    const isAdmin = await checkGroup(username, "ADMIN");
    const [existingUserAccount] = await connection.query(
      queryExistingUserAccount,
      [username]
    );

    res.status(200).json({
      username: username,
      email: existingUserAccount[0].email,
      isActive: existingUserAccount[0].isActive,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.log(`Error while loading session of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while loading session of ${username}'s.`);
  }
};
