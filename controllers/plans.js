const connection = require("../config/database");

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9 ]+$/.test(str);
}

exports.loadPlans = async (req, res) => {
  const { app_acronym } = req.body;
  const queryExistingPlans = "SELECT * FROM plan WHERE plan_app_acronym = ?";
  try {
    const [existingPlans] = await connection.query(queryExistingPlans, [
      app_acronym,
    ]);
    const planNames = existingPlans.map((plan) => plan.plan_mvp_name);
    planNames.unshift('');
    res.status(200).json({ existingPlans, planNames });
  } catch (error) {
    console.error("Error while loading accounts and groups:", error);
    res.status(500).json({
      success: false,
      message: `An error occured while loading plans: ${error.message}`,
    });;
  }
};

exports.createPlan = async (req, res) => {
  const {
    plan_app_acronym,
    plan_mvp_name,
    plan_startdate,
    plan_enddate,
    plan_colour,
  } = req.body;
  const queryExistingPlan =
    "SELECT COUNT(*) AS count FROM plan WHERE plan_app_acronym = ? AND plan_mvp_name = ?";
  const queryInsertPlan =
    "INSERT INTO plan (plan_app_acronym, plan_mvp_name, plan_startdate, plan_enddate, plan_colour) VALUES (?, ?, ?, ?, ?);";
  const errorMessages = {};

  if (!plan_mvp_name) {
    errorMessages.plan_mvp_name = "Plan name is empty";
  } else if (!isAlphanumeric(plan_mvp_name)) {
    errorMessages.plan_mvp_name = "Plan name must be alphanumeric";
  }

  if (!plan_startdate) {
    errorMessages.plan_startdate = "Invalid Start Date";
  }

  if (!plan_enddate) {
    errorMessages.plan_enddate = "Invalid End Date";
  }

  try {
    const [existingPlan] = await connection.query(queryExistingPlan, [
      plan_app_acronym,
      plan_mvp_name,
    ]);

    if (existingPlan[0].count > 0) {
      errorMessages.plan_mvp_name = "Plan name already exists";
      return res.status(400).json({
        success: false,
        fields: errorMessages,
      });
    }
    
    if (Object.keys(errorMessages).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid details",
        fields: errorMessages,
      });
    }
    
      await connection.query(queryInsertPlan, [
        plan_app_acronym,
        plan_mvp_name,
        plan_startdate,
        plan_enddate,
        plan_colour,
      ]);
      return res.status(200).json({
        success: false,
        message: "Plan successfully created",
      });
  } catch (error) {
    console.error("Error while creating plans: ", error);
    res
      .status(500).json({
      success: false,
      message: `An error occured while creating plans: ${error.message}`,
    });
  }
};
