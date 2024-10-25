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

exports.checkUserGroup = (group) => {
  return async (req, res, next) => {
    const username = req.username;

    try {
      const userIsInGroup = await checkGroup(username, group);
      if (!userIsInGroup) {
        return res.status(403).json({
          success: false,
          message: `Error: No longer ${group}`,
        });
      }
      next();
    } catch (error) {
      res
        .status(500)
        .send(
          `An error occurred while loading checking group of ${username}.`,
          error.message
        );
    }
  };
} 

exports.checkAccount = async (req, res) => {
  const username = req.username;
  const queryExistingUserAccount =
    "SELECT email, isActive FROM accounts WHERE username = ?";
  
  try {
    const isAdmin = await checkGroup(username, "ADMIN");
    const isPL = await checkGroup(username, "PL");
    const isPM = await checkGroup(username, "PM");
    const [existingUserAccount] = await connection.query(
      queryExistingUserAccount,
      [username]
    );

    res.status(200).json({
      username: username,
      email: existingUserAccount[0].email,
      isActive: existingUserAccount[0].isActive,
      isAdmin: isAdmin,
      isPL: isPL,
      isPM: isPM,
    });
  } catch (error) {
    console.error(`Error while loading session of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while loading session of ${username}'s.`);
  }
};

exports.checkPermit = async (req, res) => {
  const username = req.username;
  const { app_acronym } = req.body;
  const queryExistingAppPermit =
    "SELECT app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done FROM application WHERE app_acronym = ?";
  
  try {
    const [existingAppPermit] = await connection.query(queryExistingAppPermit, [app_acronym]);
    const app_permit_create = await checkGroup(username, existingAppPermit[0].app_permit_create);
    const app_permit_open = await checkGroup(username, existingAppPermit[0].app_permit_open);
    const app_permit_todolist = await checkGroup(username, existingAppPermit[0].app_permit_todolist);
    const app_permit_doing = await checkGroup(username, existingAppPermit[0].app_permit_doing);
    const app_permit_done = await checkGroup(username, existingAppPermit[0].app_permit_done);

    res.status(200).json({
      app_permit_create: app_permit_create,
      app_permit_open: app_permit_open,
      app_permit_todolist: app_permit_todolist,
      app_permit_doing: app_permit_doing,
      app_permit_done: app_permit_done,
    });
  } catch (error) {
    console.error(`Error while checking permits of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while checking permits of ${username}'s.`);
  }
};

exports.validatePermit = async (req, res, next) => {
  const username = req.username;
  const { task_app_acronym, task_state } = req.body;
  const queryExistingAppPermit =
    "SELECT app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done FROM application WHERE app_acronym = ?";

  try {
    const [existingAppPermit] = await connection.query(queryExistingAppPermit, [task_app_acronym]);
    
    switch (task_state) {
      case "Open": 
      const app_permit_create = await checkGroup(username, existingAppPermit[0].app_permit_create);
      const app_permit_open = await checkGroup(username, existingAppPermit[0].app_permit_open);
      if (!app_permit_create && req.url === "/createtask") {
        return res.status(403).json({
          success: false,
          message: "Error: No more permissions for creating task",
        });
      } else if (!app_permit_open && req.url !== "/createtask") {
        return res.status(403).json({
          success: false,
          message: "Error: No more permissions for open state",
        });
      } else {
        next();
      }
      break;

      case "Todo": 
      const app_permit_todolist = await checkGroup(username, existingAppPermit[0].app_permit_todolist);
      if (!app_permit_todolist) {
        return res.status(403).json({
          success: false,
          message: "Error: No more permissions for todo state",
        });
      } else {
        next();
      }
      break;

      case "Doing": 
      const app_permit_doing = await checkGroup(username, existingAppPermit[0].app_permit_doing);
      if (!app_permit_doing) {
        return res.status(403).json({
          success: false,
          message: "Error: No more permissions for doing state",
        });
      } else {
        req.app_permit_done = existingAppPermit[0].app_permit_done;
        next();
      }
      break;

      case "Done": 
      const app_permit_done = await checkGroup(username, existingAppPermit[0].app_permit_done);
      if (!app_permit_done) {
        return res.status(403).json({
          success: false,
          message: "Error: No more permissions for done state",
        });
      } else {
        next();
      }
      break;

      default:
      return res.status(400).json({
        success: false,
        message: "Invalid task state",
      });
    }
  } catch (error) {
    console.error(`Error while validating permits of ${username}:`, error);
    res
      .status(500)
      .send(`An error occurred while validating permits of ${username}'s.`);
 }
}