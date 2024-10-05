const connection = require("../config/database");

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

exports.create = async (req, res) => {
  const { groupname } = req.body;
  const queryExistingGroup =
    "SELECT DISTINCT groupname FROM user_groups WHERE groupname = ?";
  const queryInsertGroup =
    "INSERT INTO user_groups (groupname, username) VALUES (?, '')";

  console.log(groupname);
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
    const [existingGroup] = await connection.query(queryExistingGroup, [groupname]);

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
