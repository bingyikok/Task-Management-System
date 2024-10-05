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

exports.create = async (req, res) => {
  console.log("request.body: ", req.body);
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

  console.log("error messages: ", errorMessages);

  if (Object.keys(errorMessages) > 0) {
    // Return all errors if any exist
    return res.status(400).json({
      success: false,
      fields: errorMessages,
    });
  }

  try {
    //Will run when all constraints are met
    const [existingUser] = await connection.query(queryExistingUser, [username, email]);

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
    console.log(hashedPassword);

    // Insert the new user into the accounts table
    await connection.query(queryInsertAccount, [
      username,
      hashedPassword,
      email,
      isActive,
    ]);

    // Insert new username & group(s) into user_groups if assigned
    for (let index = 0; index < groupname.length; index++) {
        console.log(groupname[index]);
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
