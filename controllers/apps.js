const connection = require("../config/database");

function isAlphanumeric(str) {
  return /^[a-zA-Z0-9 ]+$/.test(str);
}

function noZero(str) {
  return /^(0|[1-9]\d*)$/.test(str);
}

exports.loadApps = async (req, res) => {
  const queryExistingApps = "SELECT * FROM application";
  try {
    const [existingApps] = await connection.query(queryExistingApps);
    res.status(200).json(existingApps);
  } catch (error) {
    console.error("Error while loading apps:", error);
    res
      .status(500)
      .send(`An error occured while loading apps: ${error.message}`);
  }
};

exports.loadApp = async (req, res) => {
  const { app_acronym } = req.body;
  const queryExistingApp = "SELECT * FROM application WHERE app_acronym = ?";
  try {
    const [existingApp] = await connection.query(queryExistingApp, [
      app_acronym,
    ]);
    res.status(200).json(...existingApp);
  } catch (error) {
    console.error("Error while loading apps:", error);
    res
      .status(500)
      .send(`An error occured while loading app: ${error.message}`);
  }
};

exports.createApp = async (req, res) => {
  const {
    app_acronym,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
    app_description,
  } = req.body;
  const queryExistingApp =
    "SELECT COUNT(*) AS count FROM application WHERE app_acronym = ?";
  const queryInsertApp =
    "INSERT INTO application (app_acronym, app_rnumber, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done, app_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const errorMessages = {};

  if (!app_acronym) {
    errorMessages.app_acronym = "App Name Empty";
  } else if (!isAlphanumeric(app_acronym)) {
    errorMessages.app_acronym = "App Name must be alphanumeric";
  }
  if (!app_rnumber) {
    errorMessages.app_rnumber = "Rnumber Empty";
  } else if (!Number.isInteger(Number(app_rnumber))) {
    errorMessages.app_rnumber = "Invalid Rnumber";
  } else if (!noZero(app_rnumber)) {
    errorMessages.app_rnumber = "Invalid Rnumber";
  }

  if (!app_startdate) {
    errorMessages.app_startdate = "Invalid Start Date";
  }
  if (!app_enddate) {
    errorMessages.app_enddate = "Invalid End Date";
  }

  try {
    const [[existingApp]] = await connection.query(queryExistingApp, [
      app_acronym,
    ]);

    if (existingApp.count > 0) {
      errorMessages.app_acronym = "App Name already exists";
    }

    if (Object.keys(errorMessages).length > 0) {
      return res.status(400).json({
        success: false,
        fields: errorMessages,
        message: "Incomplete app details",
      });
    }

    await connection.query(queryInsertApp, [
      app_acronym,
      app_rnumber,
      app_startdate,
      app_enddate,
      app_permit_create,
      app_permit_open,
      app_permit_todolist,
      app_permit_doing,
      app_permit_done,
      app_description,
    ]);
    return res.status(200).json({
      success: true,
      message: "App successfully created",
    });
  } catch (error) {
    console.error("Error while creating apps:", error);
    return res
      .status(500)
      .send(`An error occured while creating app: ${error.message}`);
  }
};

exports.updateApp = async (req, res) => {
  const updateApp = req.body;
  const {
    app_acronym,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = updateApp;
  const queryExistingApp = "SELECT * FROM application WHERE app_acronym = ?";
  const queryUpdateApp =
    "UPDATE application SET app_startdate = ?, app_enddate = ?, app_permit_create = ?, app_permit_open = ?, app_permit_todolist = ?, app_permit_doing = ?, app_permit_done = ? WHERE app_acronym = ?";

  try {
    const [[existingApp]] = await connection.query(queryExistingApp, [
      app_acronym,
    ]);

    if (JSON.stringify(existingApp) === JSON.stringify(updateApp)) {
      return res.status(400).json({
        success: false,
        message: "Nothing was updated",
      });
    } else {
      await connection.query(queryUpdateApp, [
        app_startdate,
        app_enddate,
        app_permit_create,
        app_permit_open,
        app_permit_todolist,
        app_permit_doing,
        app_permit_done,
        app_acronym,
      ]);
      return res.status(200).json({
        success: true,
        message: "App successfully updated",
      });
    }
  } catch (error) {
    console.error("Error while updating apps:", error);
    return res
      .status(500)
      .send(`An error occured while updating app: ${error.message}`);
  }
};
