const connection = require("../config/database");

exports.load = async (req, res) => {
  const queryExistingUsers = "SELECT username, email, isActive FROM accounts";
  const queryExistingGroups = "SELECT * FROM user_groups";
  // const loggedInUser = req.username;

  try {
    //Get all accounts
    let [accounts] = await connection.query(queryExistingUsers);

    //Get all user_groups
    const [userGroups] = await connection.query(queryExistingGroups);

    accounts = accounts.filter(
       account => account.username !== "admin") // Hardcoded admin

    const groupMap = {};
    userGroups.forEach((group) => {
      if (group.username !== '') {
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
