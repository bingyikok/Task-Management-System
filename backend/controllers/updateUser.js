const connection = require("../config/database");
const bcrypt = require("bcryptjs");

function isEmail(str) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(str);
}

function isPassword(str) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,10}$/.test(
    str
  );
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

exports.update = async (req, res) => {
  // console.log("request.body: ", req.body);
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
      // console.log(isMatch);
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
      // console.log("groups to add", groupToAdd[index]);
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
