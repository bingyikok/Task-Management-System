const connection = require("../config/database");

exports.load = async (req, res) => {
  const queryExistingGroups = "SELECT DISTINCT groupname FROM user_groups";

  try {
    const [existingGroups] = await connection.query(queryExistingGroups);
    let results = existingGroups.map((group) => group.groupname);

    //Send the result back
    res.status(200).json(results);
  } catch (error) {
    console.log("Error while loading users:", error);
    res
      .status(500)
      .send("An error occurred while processing the creation request.");
  }
};