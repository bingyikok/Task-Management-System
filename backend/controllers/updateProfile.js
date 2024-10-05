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

exports.update = async (req, res) => {
  let { username, password, email, change } = req.body;
  console.log(req.body);
  const queryExistingUser =
    "SELECT email, password FROM accounts WHERE username = ?";
  const queryUpdateEmail = "UPDATE accounts SET email = ? WHERE username = ?";
  const queryUpdatePassword = "UPDATE accounts SET password = ? WHERE username = ?";

  try {
    //Will run when all constraints are met
    const [existingUser] = await connection.query(queryExistingUser, [username]);

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