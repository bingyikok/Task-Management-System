const connection = require("../config/database");
const bcrypt = require("bcryptjs");

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

function isPassword(str) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,10}$/.test(
    str
  );
}

function isEmail(str) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);
}

function checkGroupChanged(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Step 3: Compare each element
  for (let index = 0; index < arr1.length; index++) {
    if (arr1[index] !== arr2[index]) {
      return false;
    } else {
    }
  }
  return true; // Arrays are identical
}

exports.createUser = async (req, res) => {
  let { username, password, email, groupname, isActive } = req.body;
  const errorMessages = {};
  const queryExistingUser =
    "SELECT * FROM accounts WHERE username = ? OR email = ?";
  const queryInsertAccount =
    "INSERT INTO accounts (username, password, email, isActive) VALUES (?, ?, ?, ?)";
  const queryInsertGroups =
    "INSERT INTO user_groups (groupname, username) VALUES (?, ?)";

  if (!username) {
    errorMessages.username = "Username field is empty";
  } else if (!isAlphanumeric(username)) {
    errorMessages.username = "Username must be alphanumeric";
  }

  if (!password) {
    errorMessages.password = "Password field is empty";
  } else if (!isPassword(password)) {
    errorMessages.password = "Password must be 8-10 characters & contain at least 1 alphabet, number and special character";
  }

  if (email === "") {
    email = null; // Set email to null if it's an empty string
  } else if (email && !isEmail(email)) {
    errorMessages.email = "Please enter a valid email";
  }

  try {
    //Will run when all constraints are met
    const [existingUser] = await connection.query(queryExistingUser, [username, email]);
    console.log(existingUser)
    if (existingUser.length > 0) {
      existingUser.forEach((result) => {
        if (result.username === username) {
          errorMessages.username = "Username is already in use";
        }
        else if (result.email === email) {
          errorMessages.email = "Email is already in use";
        }
      });
    }

    if (Object.keys(errorMessages).length > 0) {
      // Return all errors if any exist
      return res.status(400).json({
        success: false,
        fields: errorMessages,
      });
    }

    let hashedPassword = await bcrypt.hash(password, 8);

    // Insert the new user into the accounts table
    await connection.query(queryInsertAccount, [
      username,
      hashedPassword,
      email,
      isActive,
    ]);

    // Insert new username & group(s) into user_groups if assigned
    for (let index = 0; index < groupname.length; index++) {
        await connection.query(queryInsertGroups, [groupname[index], username]);
    }

    return res.status(200).json({
      success: true,
      message: "Sucessful creating user",
    });
  } catch (error) {
    // Handle any errors during the creating process
    console.error("Error while creating users:", error);
    res
      .status(500)
      .send("An error occurred while processing the creation request.");
  }
};

exports.createGroup = async (req, res) => {
  const { groupname } = req.body;
  const queryExistingGroup =
    "SELECT DISTINCT groupname FROM user_groups WHERE groupname = ?";
  const queryInsertGroup =
    "INSERT INTO user_groups (groupname, username) VALUES (?, '')";

  if (!groupname) {
    return res.status(400).json({
      success: false,
      message: "Cannot be empty",
    });
  } else if (!isAlphanumeric(groupname)) {
    return res.status(400).json({
      success: false,
      message: "Must be alphanumeric",
    });
  }

  try {
    const [existingGroup] = await connection.query(queryExistingGroup, [
      groupname,
    ]);

    if (existingGroup.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Groupname already exists",
      });
    } else {
      await connection.query(queryInsertGroup, [groupname]);

      return res.status(200).json({
        success: true,
        message: "Group creation successful",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while processing the creation request.");
  }
};

exports.loadUsers = async (req, res) => {
  const queryExistingUsers = "SELECT username, email, isActive FROM accounts";
  const queryExistingGroups = "SELECT * FROM user_groups";
  // const loggedInUser = req.username;

  try {
    //Get all accounts
    let [accounts] = await connection.query(queryExistingUsers);

    //Get all user_groups
    const [userGroups] = await connection.query(queryExistingGroups);

    accounts = accounts.filter((account) => account.username !== "admin"); // Hardcoded admin

    const groupMap = {};
    userGroups.forEach((group) => {
      if (group.username !== "") {
        if (groupMap[group.username]) {
          groupMap[group.username].push(group.groupname);
        } else {
          groupMap[group.username] = [group.groupname];
        }
      }
    });
    //Combine accounts with groupnames, mimicking a LEFT JOIN
    const results = accounts.map((account) => ({
      ...account, //spread operator to copy and concatenante arrays w/o mutating original arrays]
      groupname: groupMap[account.username] || [], // groupname will be an empty array if no match
    }));

    //Send the result back
    res.status(200).json(results); // Return the final combined results as response
  } catch (error) {
    console.error("Error while loading accounts and groups:", error);
    res.status(500).send("An error occurred while fetching data.");
  }
};

exports.loadGroups = async (req, res) => {
  const queryExistingGroups = "SELECT DISTINCT groupname FROM user_groups";

  try {
    const [existingGroups] = await connection.query(queryExistingGroups);
    let results = existingGroups.map((group) => group.groupname);

    //Send the result back
    res.status(200).json(results);
  } catch (error) {
    console.error("Error while loading users:", error);
    res
      .status(500)
      .send("An error occurred while processing the creation request.");
  }
};

exports.updateProfile = async (req, res) => {
  let { username, password, email, change } = req.body;
  const queryExistingUser =
    "SELECT email, password FROM accounts WHERE username = ?";
  const queryUpdateEmail = "UPDATE accounts SET email = ? WHERE username = ?";
  const queryUpdatePassword =
    "UPDATE accounts SET password = ? WHERE username = ?";

  try {
    //Will run when all constraints are met
    const [existingUser] = await connection.query(queryExistingUser, [
      username,
    ]);

    switch (change) {
      case "email":
        if (email === "") {
          email = null; // Set email to null if it's an empty string
          return res.status(400).json({
            success: false,
            type: "email",
            message: "Email empty",
          });
        } else if (email === existingUser[0].email) {
          return res.status(400).json({
            success: false,
            type: "email",
            message: "No change in email",
          });
        } else if (email && !isEmail(email)) {
          return res.status(400).json({
            success: false,
            type: "email",
            message: "Please enter a valid email",
          });
        }
        // Update the user email in the accounts table
        await connection.query(queryUpdateEmail, [email, username]);

        return res.status(200).json({
          success: true,
          type: "email",
          message: "Sucessful updating email",
        });

      case "password":
        let hashedPassword = existingUser[0].password;

        if (!password) {
          return res.status(400).json({
            success: false,
            type: "password",
            message: "Password empty",
          });
        } else {
          const isMatch = await bcrypt.compare(password, hashedPassword);
          if (isMatch) {
            return res.status(400).json({
              success: false,
              type: "password",
              message: "No change in password",
            });
          } else if (!isPassword(password)) {
            return res.status(400).json({
              success: false,
              type: "password",
              message:
                "Password must be 8-10 characters & contain at least 1 alphabet, number and special character",
            });
          }
          hashedPassword = await bcrypt.hash(password, 8);
        }

        // Update the user password in the accounts table
        await connection.query(queryUpdatePassword, [hashedPassword, username]);

        return res.status(200).json({
          success: true,
          type: "password",
          message: "Sucessful updating password",
        });
    }
  } catch (error) {
    console.error("Error while updating user profile:", error);
    res.status(500).send("An error occurred while changing credentials.");
  }
};

exports.updateUser = async (req, res) => {
  let { username, password, email, groupname, isActive } = req.body;
  const errorMessages = {};
  const queryExistingUser = "SELECT * FROM accounts WHERE username = ?";
  const queryUserGroup = "SELECT groupname FROM user_groups WHERE username = ?";
  const queryUpdateUserAccount =
    "UPDATE accounts SET password = ?, email = ?, isActive = ? WHERE username = ?;";
  const queryDeleteUserGroup =
    "DELETE FROM user_groups WHERE groupname = ? AND username = ?";
  const queryAddUserGroup =
    "INSERT INTO user_groups (groupname, username) VALUES (?, ?)";

  try {
    //Will run when all constraints are met
    const [existingUser] = await connection.query(queryExistingUser, [
      username,
    ]);
    let [existingUserGroup] = await connection.query(queryUserGroup, [
      username,
    ]);
    let hashedPassword = existingUser[0].password;
    const groupResultArr = existingUserGroup.map((group) => group.groupname);
    const groupToAdd = groupname.filter(
      (group) => !groupResultArr.includes(group)
    );
    const groupToDelete = groupResultArr.filter(
      (group) => !groupname.includes(group)
    );

    if (password) {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      if (isMatch) {
        errorMessages.password = "No change in password";
      } else if (!isPassword(password)) {
        errorMessages.password =
          "Password must be 8-10 characters & contain at least 1 alphabet, number and special character";
      }
      hashedPassword = await bcrypt.hash(password, 8);
    }

    if (email === "") {
      email = null; // Set email to null if it's an empty string
    } else if (email && !isEmail(email)) {
      errorMessages.email = "Please enter a valid email";
    }

    if ((username === req.username) & !isActive) {
      errorMessages.isActive = "You cannot disable yourself";
    }

    if (
      email === existingUser[0].email &&
      isActive === existingUser[0].isActive &&
      checkGroupChanged(groupname, groupResultArr) && ////Nullish Coalescing Operator
      !password
    ) {
      errorMessages.email = "No change in email";
      errorMessages.isActive = "No change in state";
      errorMessages.groupname = "No change in group";
    }

    if (Object.keys(errorMessages).length > 0) {
      // Return all errors if any exist
      return res.status(400).json({
        success: false,
        fields: errorMessages,
      });
    }

    // Update the user info in the accounts table
    await connection.query(queryUpdateUserAccount, [
      hashedPassword,
      email,
      isActive,
      username,
    ]);

    for (let index = 0; index < groupToDelete.length; index++) {
      await connection.query(queryDeleteUserGroup, [
        groupToDelete[index],
        username,
      ]);
    }

    //Delete duplicated groups
    for (let index = 0; index < groupToAdd.length; index++) {
      await connection.query(queryAddUserGroup, [groupToAdd[index], username]);
    }

    return res.status(200).json({
      success: true,
      message: "Sucessful updating user",
    });
  } catch (error) {
    console.error("Error while updating users:", error);
    res
      .status(500)
      .send("An error occurred while processing the creation request.");
  }
};