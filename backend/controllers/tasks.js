const connection = require("../config/database");
const nodemailer = require("../config/nodemailer");

function isAlphanumeric(str) {
     return /^[a-zA-Z0-9 ]+$/.test(str);
}

async function checkState(task_id, task_state) {
     const queryExistingTaskState =
          "SELECT task_state from task WHERE task_id = ?";
     try {
          const [existingTaskState] = await connection.query(
               queryExistingTaskState,
               [task_id]
          );
          return existingTaskState[0].task_state === task_state;
     } catch (error) {
          throw new Error(
               `Error while checking state of ${task_id}: ${error.message}`
          );
     }
}

exports.loadTasks = async (req, res) => {
     const { app_acronym } = req.body;
     const states = ["Open", "Todo", "Doing", "Done", "Closed"];
     const queryExistingTasks = "SELECT * FROM task WHERE task_app_acronym = ?";
     const queryExistingPlans =
          "SELECT plan_mvp_name, plan_colour FROM plan WHERE plan_app_acronym = ?";

     try {
          const [existingTasks] = await connection.query(queryExistingTasks, [
               app_acronym,
          ]);
          const [existingPlans] = await connection.query(queryExistingPlans, [
               app_acronym,
          ]);
          let planObj = {};
          existingPlans.forEach((plan) => {
               Object.assign(planObj, {
                    [plan.plan_mvp_name]: plan.plan_colour,
               });
          });
          const tasks = existingTasks.map((task) => ({
               ...task,
               plan_colour: planObj[task.task_plan],
          }));

          const groupedTasks = states.map((state) =>
               tasks.filter((task) => task.task_state === state)
          );
          res.status(200).json(groupedTasks);
     } catch (error) {
          console.error("Error while loading tasks:", error);
          res.status(500).send(
               `An error occured while loading tasks: ${error.message}`
          );
     }
};

exports.loadTask = async (req, res) => {
     const { task_id } = req.body;
     const queryExistingTask = "SELECT * FROM task WHERE task_id = ?";

     try {
          const [existingTask] = await connection.query(queryExistingTask, [
               task_id,
          ]);
          res.status(200).json(existingTask[0]);
     } catch (error) {
          console.error("Error while loading task:", error);
          res.status(500).send(
               `An error occured while loading task: ${error.message}`
          );
     }
};

exports.createTask = async (req, res) => {
     const {
          task_name,
          task_app_acronym,
          task_plan,
          task_state,
          task_creator,
          task_owner,
          task_description,
          task_notes,
     } = req.body;

     const username = req.username;
     const task_createdate = new Date().toISOString().slice(0, 10);
     const time = new Date().toLocaleTimeString();
     let newNote;

     if (task_notes) {
          newNote = `**********\n[USER: ${username}, STATE: ${task_state}, DATE: ${task_createdate}, TIME: ${time}]\n(Task Created)\n${task_notes}\n\n`;
     } else {
          newNote = task_notes; //empty string
     }
     const queryRnumber =
          "SELECT app_rnumber FROM application WHERE app_acronym = ?";
     const queryInsertTask =
          "INSERT INTO task (task_app_acronym, task_id, task_name, task_description, task_plan, task_state, task_creator, task_owner, task_createdate, task_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
     const queryUpdateApp =
          "UPDATE application SET app_rnumber = ? WHERE app_acronym = ?";

     if (!task_name) {
          return res.status(400).json({
               success: false,
               message: "Task name empty",
          });
     } else if (!isAlphanumeric(task_name)) {
          return res.status(400).json({
               success: false,
               message: "Task name must be alphanumeric",
          });
     }

     const transaction = await connection.getConnection();

     try {
          await transaction.beginTransaction();

          const [rnumber] = await transaction.query(queryRnumber, [
               task_app_acronym,
          ]);
          const app_rnumber = rnumber[0].app_rnumber + 1;
          const task_id = `${task_app_acronym}_${app_rnumber}`;

          await transaction.query(queryInsertTask, [
               task_app_acronym,
               task_id,
               task_name,
               task_description,
               task_plan,
               task_state,
               task_creator,
               task_owner,
               task_createdate,
               newNote,
          ]);

          await transaction.query(queryUpdateApp, [
               app_rnumber,
               task_app_acronym,
          ]);
          await transaction.commit();

          res.status(200).json({
               success: true,
               message: "Task successfully created",
          });
     } catch (error) {
          await transaction.rollback();
          console.error("Error while creating task:", error);
          res.status(500).send(
               `An error occured while creating task: ${error.message}`
          );
     } finally {
          transaction.releaseConnection;
     }
};

exports.saveChanges = async (req, res) => {
     const { task_id, task_state, task_notes, task_plan } = req.body;
     const username = req.username;
     const date = new Date().toISOString().slice(0, 10);
     const time = new Date().toLocaleTimeString();
     const newNote = `**********\n[USER: ${username}, STATE: ${task_state}, DATE: ${date}, TIME: ${time}]\n${task_notes}\n\n`;
     const queryExistingTaskPlan =
          "SELECT COUNT(*) AS count FROM task WHERE task_id = ? AND task_plan = ?";
     const queryUpdateTaskPlan =
          "UPDATE task SET task_plan = ? WHERE task_id = ?";
     const queryUpdateTaskNotes =
          "UPDATE task SET task_notes = CONCAT(?, task_notes), task_owner = ? WHERE task_id = ?";
     const stateConsistent = await checkState(task_id, task_state);

     if (!stateConsistent) {
          return res.status(400).json({
               success: false,
               message: `${task_id} is no longer in ${task_state} state.`,
          });
     }

     try {
          const [existingTaskPlan] = await connection.query(
               queryExistingTaskPlan,
               [task_id, task_plan]
          );
          if ((existingTaskPlan.count < 0 && task_state === "Open") || "Done") {
               await connection.query(queryUpdateTaskPlan, [
                    task_plan,
                    task_id,
               ]);
          }
          if (task_notes) {
               await connection.query(queryUpdateTaskNotes, [
                    newNote,
                    username,
                    task_id,
               ]);
          }

          res.status(200).json({
               success: true,
               message: "Changes updated successfully",
          });
     } catch (error) {
          console.error("Error while updating changes:", error.message);
          res.status(500).send(
               `Error while updating changes: ${error.message}`
          );
     }
};

exports.promoteTask = async (req, res) => {
     const { task_id, task_state, task_notes, task_plan } = req.body;
     const username = req.username;
     const date = new Date().toISOString().slice(0, 10);
     const time = new Date().toLocaleTimeString();
     const queryExistingTaskPlan =
          "SELECT COUNT(*) AS count FROM task WHERE task_id = ? AND task_plan = ?";
     const queryUpdateTaskPlan =
          "UPDATE task SET task_plan = ? WHERE task_id = ?";
     let promote_state;
     const queryPromoteState =
          "UPDATE task SET task_state = ?, task_owner = ?, task_notes = CONCAT(?, task_notes) WHERE task_id = ?";
     const stateConsistent = await checkState(task_id, task_state);
     if (!stateConsistent) {
          return res.status(400).json({
               success: false,
               message: `${task_id} is no longer in ${task_state} state.`,
          });
     } else {
          switch (task_state) {
               case "Open":
                    promote_state = "Todo";
                    break;

               case "Todo":
                    promote_state = "Doing";
                    break;

               case "Doing":
                    promote_state = "Done";
                    break;

               case "Done":
                    promote_state = "Closed";
                    break;
          }

          try {
               const [[existingTaskPlan]] = await connection.query(
                    queryExistingTaskPlan,
                    [task_id, task_plan]
               );
               const newNote = `**********\n[USER: ${username}, STATE: ${task_state}, DATE: ${date}, TIME: ${time}]\n(State promoted from ${task_state} to ${promote_state})\n${task_notes}\n\n`;

               if (existingTaskPlan.count === 0 && task_state === "Open") {
                    await connection.query(queryUpdateTaskPlan, [
                         task_plan,
                         task_id,
                    ]);
               }

               await connection.query(queryPromoteState, [
                    promote_state,
                    username,
                    newNote,
                    task_id,
               ]);

               const app_permit_done = req.app_permit_done;
               if (app_permit_done) {
                    const emailSent = await nodemailer.sendMail(
                         app_permit_done,
                         task_id
                    );
                    if (!emailSent) {
                         return res.status(400).json({
                              success: false,
                              message: "Task promoted but failed to send notification email",
                         });
                    }
               }

               return res.status(200).json({
                    success: true,
                    message: "Task released succcessfully",
               });
          } catch (error) {
               console.error("Error while updating task notes:", error.message);
               res.status(500).send(
                    `Error while updating task notes: ${error.message}`
               );
          }
     }
};

exports.demoteTask = async (req, res) => {
     const { task_id, task_state, task_notes, task_plan } = req.body;
     const username = req.username;
     const date = new Date().toISOString().slice(0, 10);
     const time = new Date().toLocaleTimeString();
     const queryExistingTaskPlan =
          "SELECT COUNT(*) AS count FROM task WHERE task_id = ? AND task_plan = ?";
     const queryUpdateTaskPlan =
          "UPDATE task SET task_plan = ? WHERE task_id = ?";
     let demote_state;
     const queryDemoteState =
          "UPDATE task SET task_state = ?, task_owner = ?, task_notes = CONCAT(?, task_notes) WHERE task_id = ?";
     const stateConsistent = await checkState(task_id, task_state);
     if (!stateConsistent) {
          return res.status(400).json({
               success: false,
               message: `${task_id} is no longer in ${task_state} state.`,
          });
     } else {
          switch (task_state) {
               case "Closed":
                    demote_state = "Done";
                    break;

               case "Done":
                    demote_state = "Doing";
                    break;

               case "Doing":
                    demote_state = "Todo";
                    break;

               case "Todo":
                    demote_state = "Open";
                    break;
          }
          try {
               const [[existingTaskPlan]] = await connection.query(
                    queryExistingTaskPlan,
                    [task_id, task_plan]
               );
               const newNote = `**********\n[USER: ${username}, STATE: ${task_state}, DATE: ${date}, TIME: ${time}]\n(State demoted from ${task_state} to ${demote_state})\n${task_notes}\n\n`;

               if (
                    existingTaskPlan.count === 0 &&
                    (task_state === "Open" || task_state === "Done")
               ) {
                    await connection.query(queryUpdateTaskPlan, [
                         task_plan,
                         task_id,
                    ]);
                    console.log(task_plan);
               }

               await connection.query(queryDemoteState, [
                    demote_state,
                    username,
                    newNote,
                    task_id,
               ]);
               return res.status(200).json({
                    success: true,
                    message: "Task released succcessfully",
               });
          } catch (error) {
               console.error("Error while updating task notes:", error.message);
               res.status(500).send(
                    `Error while updating task notes: ${error.message}`
               );
          }
     }
};
