const connection = require("../config/database");
let isAdmin = false;

async function checkGroup(username) {
  const queryExistingUserGroup =
    "SELECT groupname FROM user_groups WHERE username = ?";

  try {
    const [existingUserGroup] = await connection.query(queryExistingUserGroup, [
      username,
    ]);

    if (existingUserGroup.length < 1) return [];

    else return existingUserGroup;
  } catch (error) {
    res
      .status(500)
      .send(`An error occurred while loading checking group of ${username}.`);
  }
}

exports.checkIsAdmin = async (req, res, next) => {
  const username = req.username;
  const groupname = await checkGroup(username);
  
  isAdmin = false;
  
  if (groupname.length) {
    isAdmin = groupname.some(
      (group) => group.groupname.toUpperCase() === "ADMIN"
    );
  }
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
};


exports.checkAccount = async (req, res) => {
  const username = req.username
  const groupname = await checkGroup(username);
  const queryExistingUserAccount =
    "SELECT email, isActive FROM accounts WHERE username = ?";

  isAdmin = false;

  if (groupname.length) {
    isAdmin = groupname.some(
      (group) => group.groupname.toUpperCase() === "ADMIN"
    );
  }

  try {
    const [existingUserAccount] = await connection.query(
      queryExistingUserAccount,
      [username]
    );

    res.status(200).json({
      username: username,
      email: existingUserAccount[0].email,
      isActive: existingUserAccount[0].isActive,
      groupname: groupname,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.log(`Error while loading session of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while loading session of ${username}'s.`);
  }
};
