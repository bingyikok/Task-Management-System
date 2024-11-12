const connection = require("../config/database");
const bcrypt = require("bcryptjs");
const nodemailer = require("../config/nodemailer");

exports.createTask = async (req, res) => {
     const isValidURL = /^[a-zA-Z0-9]+$/.test(req.url.slice(1));
     const isJSON =
          req.headers["content-type"]?.endsWith("json") ||
          req.is("application/json");
     const hasJSON = typeof req.body === "object" && !Array.isArray(req.body);
     const credentialKeys = ["username", "password"];
     const mandatoryKeys = [
          "username",
          "password",
          "task_app_acronym",
          "task_name",
     ];

     const optionalKeys = ["task_description", "task_notes", "task_plan"];

     const hasMandatoryKeys = mandatoryKeys.every((key) =>
          req.body.hasOwnProperty(key)
     );

     const isValidCredential = credentialKeys.every((key) => {
          const value = req.body[key] ?? "";
          return (
               typeof value === "string" && value !== "" && value.length <= 50
          );
     });

     if (!isValidURL) {
          //URL contains special char
          return res.json({
               code: "A001",
          });
     } else if (!isJSON || !hasJSON) {
          //URL content-type not JSON or body not Object
          return res.json({
               code: "B001",
          });
     } else if (!hasMandatoryKeys) {
          //body does not contain all mandatory keys
          return res.json({
               code: "B002",
          });
     } else if (!isValidCredential) {
          //credential value missing or not string or '' or over 50 char
          return res.json({
               code: "C001",
          });
     }

     const queryExistingUserAccount =
          "SELECT * FROM accounts WHERE username = ?";
     const {
          username,
          password,
          task_app_acronym,
          task_name,
          task_description,
          task_notes,
          task_plan,
     } = req.body;

     const transaction = await connection.getConnection();

     try {
          const [[existingUserAccount]] = await connection.query(
               queryExistingUserAccount,
               [username]
          );

          if (!existingUserAccount || existingUserAccount.isActive !== 1) {
               //Username does not exist or disabled
               return res.json({
                    code: "C001",
               });
          } else {
               const isMatch = await bcrypt.compare(
                    password,
                    existingUserAccount.password
               );
               if (!isMatch) {
                    //PW wrong
                    return res.json({
                         code: "C001",
                    });
               }

               if (
                    !task_app_acronym ||
                    typeof task_app_acronym !== "string" ||
                    task_app_acronym.length > 50
               ) {
                    return res.json({
                         //invalid app acronym
                         code: "D001",
                    });
               }

               const queryAppInfo =
                    "SELECT app_permit_create, app_rnumber FROM application WHERE app_acronym = ?";
               const [[appInfo]] = await connection.query(queryAppInfo, [
                    task_app_acronym,
               ]);

               if (!appInfo || !appInfo.app_rnumber) {
                    return res.json({
                         //no existing app
                         code: "D001",
                    });
               }
               if (!appInfo.app_permit_create) {
                    return res.json({
                         //app no permit create
                         code: "C003",
                    });
               }

               const queryCheckGroup =
                    "SELECT COUNT(*) AS count FROM user_groups WHERE username = ? AND groupname = ?";
               const [[checkGroup]] = await connection.query(queryCheckGroup, [
                    username,
                    appInfo.app_permit_create,
               ]);

               if (checkGroup.count === 0) {
                    return res.json({
                         //User don't have app_permit_create
                         code: "C003",
                    });
               }

               const isValidMandatoryKey = mandatoryKeys.every((key) => {
                    const value = req.body[key] ?? "";
                    return (
                         value !== "" &&
                         typeof value === "string" &&
                         value.length <= 50
                    );
               });

               const isValidOptionalKey = optionalKeys.every((key) => {
                    req.body[key] = req.body[key] ?? "";
                    const value = req.body[key];

                    if (key === "task_description") {
                         return (
                              typeof value === "string" && value.length <= 255
                         );
                    } else if (key === "task_notes") {
                         return typeof value === "string";
                    } else if (key === "task_plan") {
                         return typeof value === "string" && value.length <= 50;
                    }
               });

               if (!isValidMandatoryKey || !isValidOptionalKey) {
                    //values of keys invalid
                    return res.json({
                         code: "D001",
                    });
               }

               if (!/^[a-zA-Z0-9 ]+$/.test(task_name)) {
                    //Task_name not alphanumeric
                    return res.json({
                         code: "D001",
                    });
               }

               const queryExistingPlan =
                    "SELECT COUNT(*) AS count FROM plan WHERE plan_mvp_name = ? AND plan_app_acronym = ?";
               const [[existingPlan]] = await connection.query(
                    queryExistingPlan,
                    [task_plan, task_app_acronym]
               );

               if (task_plan && existingPlan.count === 0) {
                    //Cannot find plan
                    return res.json({
                         code: "D001",
                    });
               } else {
                    const queryInsertTask =
                         "INSERT INTO task (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    const queryIncrementRnumber =
                         "UPDATE application SET app_rnumber = ? WHERE app_acronym = ?";
                    const newRnumber = appInfo.app_rnumber + 1;
                    const task_id = `${task_app_acronym}_${newRnumber}`;
                    const task_createdate = new Date()
                         .toISOString()
                         .slice(0, 10);
                    const time = new Date().toLocaleTimeString();
                    const newNote = `**********\n[USER: ${username}, STATE: -, DATE: ${task_createdate}, TIME: ${time}]\n(Task Created)\n${
                         task_notes ?? ""
                    }\n\n`;

                    await transaction.beginTransaction();

                    const [insertTask] = await transaction.query(
                         queryInsertTask,
                         [
                              task_id,
                              task_name,
                              task_description ?? "",
                              newNote,
                              task_plan ?? "",
                              task_app_acronym,
                              "Open",
                              username,
                              username,
                              task_createdate,
                         ]
                    );

                    const [incrementRnumber] = await transaction.query(
                         queryIncrementRnumber,
                         [newRnumber, task_app_acronym]
                    );

                    if (
                         insertTask.affectedRows === 0 ||
                         incrementRnumber.affectedRows === 0
                    ) {
                         await transaction.rollback();
                         return res.json({
                              //Error during transaction
                              code: "D001",
                         });
                    }
                    await transaction.commit();

                    return res.json({
                         task_id: task_id,
                         code: "S000",
                    });
               }
          }
     } catch (error) {
          await transaction.rollback();
          return res.json({
               code: "E004",
          });
     } finally {
          await transaction.release();
     }
};

exports.gettaskbystate = async (req, res) => {
     const isValidURL = /^[a-zA-Z0-9]+$/.test(req.url.slice(1));
     const isJSON =
          req.headers["content-type"]?.endsWith("json") ||
          req.is("application/json");
     const hasJSON = typeof req.body === "object" && !Array.isArray(req.body);
     const mandatoryKeys = [
          "username",
          "password",
          "task_app_acronym",
          "task_state",
     ];
     const hasMandatoryKeys = mandatoryKeys.every((key) =>
          req.body.hasOwnProperty(key)
     );
     const nonCredentials = ["task_app_acronym", "task_state"];
     const credentials = ["username", "password"];
     const taskStates = ["open", "todo", "doing", "done", "closed"];

     const isValidNonCredential = nonCredentials.every((key) => {
          const value = req.body[key] ?? "";
          if (key === "task_state") {
               return value !== "" && value.length <= 10;
          } else if (key === "task_app_acronym") {
               return value !== "" && value.length <= 50;
          }
     });

     const isValidCredential = credentials.every((key) => {
          const value = req.body[key] ?? "";
          return (
               value !== "" && value.length <= 50 && typeof value === "string"
          );
     });

     if (!isValidURL) {
          //URL contains special char
          return res.json({
               code: "A001",
          });
     } else if (!isJSON || !hasJSON) {
          //URL content-type not JSON or body not Object
          return res.json({
               code: "B001",
          });
     } else if (!hasMandatoryKeys) {
          return res.json({
               code: "B002",
          });
     } else if (!isValidCredential) {
          return res.json({
               code: "C001",
          });
     } else if (!isValidNonCredential) {
          return res.json({
               code: "D001",
          });
     }

     const queryExistingUserAccount =
          "SELECT * FROM accounts WHERE username = ?";
     const { username, password, task_app_acronym, task_state } = req.body;

     try {
          const [[existingUserAccount]] = await connection.query(
               queryExistingUserAccount,
               [username]
          );

          if (!existingUserAccount || existingUserAccount.isActive !== 1) {
               //Username does not exist or disabled
               return res.json({
                    code: "C001",
               });
          } else {
               const isMatch = await bcrypt.compare(
                    password,
                    existingUserAccount.password
               );
               if (!isMatch) {
                    //PW wrong
                    return res.json({
                         code: "C001",
                    });
               }
          }

          const isValidTaskState = taskStates.includes(
               task_state.toLowerCase()
          );

          const queryExistingAppAcronym =
               "SELECT COUNT(*) AS count FROM application WHERE app_acronym = ?";
          const [[existingAppAcronym]] = await connection.query(
               queryExistingAppAcronym,
               [task_app_acronym]
          );

          if (existingAppAcronym.count === 0 || !isValidTaskState) {
               //App_acronym or state don't exist
               return res.json({
                    code: "D001",
               });
          }

          const querytaskByState =
               "SELECT task_id, task_name, task_owner, task_plan FROM task WHERE task_app_acronym = ? AND task_state = ?";
          const [taskByState] = await connection.query(querytaskByState, [
               task_app_acronym,
               task_state,
          ]);

          if (taskByState.affectedRows === 0) {
               return res.json({
                    code: "D001",
               });
          }

          const queryPlans =
               "SELECT plan_mvp_name, plan_colour FROM plan WHERE plan_app_acronym = ?";
          const [plans] = await connection.query(queryPlans, [
               task_app_acronym,
          ]);

          let plan_colour = {};
          plans.forEach((plan) => {
               Object.assign(plan_colour, {
                    [plan.plan_mvp_name]: plan.plan_colour,
               });
          });

          const tasks = taskByState.map((task) => {
               const { task_plan, ...taskWithoutPlanKey } = task;
               return {
                    ...taskWithoutPlanKey,
                    plan_colour: plan_colour[task.task_plan],
               };
          });

          return res.json({
               tasks,
               code: "S000",
          });
     } catch (error) {
          return res.json({
               code: "E004",
          });
     }
};

exports.promotetask2done = async (req, res) => {
     const isValidURL = /^[a-zA-Z0-9]+$/.test(req.url.slice(1));

     const isJSON =
          req.headers["content-type"]?.endsWith("json") ||
          req.is("application/json");
     const hasJSON = typeof req.body === "object" && !Array.isArray(req.body);
     const credentials = ["username", "password"];
     const mandatoryKeys = ["username", "password", "task_id"];
     const nonCredentials = ["task_id", "task_notes"];
     const hasMandatoryKeys = mandatoryKeys.every((key) =>
          req.body.hasOwnProperty(key)
     );
     const isValidCredential = credentials.every((key) => {
          const value = req.body[key] ?? "";
          return (
               value !== "" && typeof value === "string" && value.length <= 50
          );
     });
     const isValidNonCredential = nonCredentials.every((key) => {
          const value = req.body[key] ?? "";
          if (key === "task_id") {
               return (
                    value !== "" &&
                    typeof value === "string" &&
                    value.length <= 100
               );
          } else if (key === "task_notes") {
               return typeof value === "string";
          }
     });

     if (!isValidURL) {
          //URL contains special char
          return res.json({
               code: "A001",
          });
     } else if (!isJSON || !hasJSON) {
          //URL content-type not JSON or body not Object
          return res.json({
               code: "B001",
          });
     } else if (!hasMandatoryKeys) {
          //Missing mandatory parameter key
          return res.json({
               code: "B002",
          });
     } else if (!isValidCredential) {
          //Credential wrong type, length or ''
          return res.json({
               code: "C001",
          });
     } else if (!isValidNonCredential) {
          //Non credential wrong type, length or ''
          return res.json({
               code: "D001",
          });
     }

     const queryExistingUserAccount =
          "SELECT * FROM accounts WHERE username = ?";
     const queryExistingTaskState =
          "SELECT task_state from task WHERE task_id = ?";
     const queryPromoteDoingToDone =
          "UPDATE task SET task_state = 'Done', task_notes = CONCAT(? , task_notes) WHERE task_id = ?";
     const { username, password, task_id, task_notes } = req.body;

     try {
          const [[existingUserAccount]] = await connection.query(
               queryExistingUserAccount,
               [username]
          );

          if (!existingUserAccount || existingUserAccount.isActive !== 1) {
               //Username does not exist or disabled
               return res.json({
                    code: "C001",
               });
          } else {
               const isMatch = await bcrypt.compare(
                    password,
                    existingUserAccount.password
               );
               if (!isMatch) {
                    //PW wrong
                    return res.json({
                         code: "C001",
                    });
               }
          }

          //ADD DEV PERMIT here
          const app_acronym = task_id.split("_")[0];
          const queryAppInfo =
               "SELECT app_permit_doing, app_permit_done FROM application WHERE app_acronym = ?";
          const [[appInfo]] = await connection.query(queryAppInfo, [
               app_acronym,
          ]);
          const queryCheckGroup =
               "SELECT COUNT(*) AS count FROM user_groups WHERE username = ? AND groupname = ?";
          const [[checkGroup]] = await connection.query(queryCheckGroup, [
               username,
               appInfo.app_permit_doing,
          ]);

          if (checkGroup.count === 0) {
               return res.json({
                    //User don't have app_permit_doing
                    code: "C003",
               });
          }

          const [[existingTaskState]] = await connection.query(
               queryExistingTaskState,
               [task_id]
          );

          if (!existingTaskState || existingTaskState.task_state !== "Doing") {
               return res.json({
                    //task not in doing state or task_id dont exist
                    code: "D001",
               });
          } else {
               const date = new Date().toISOString().slice(0, 10);
               const time = new Date().toLocaleTimeString();
               const newNote = `**********\n[USER: ${username}, STATE: Doing, DATE: ${date}, TIME: ${time}]\n(State promoted from Doing to Done)\n${
                    task_notes ?? ""
               }\n\n`;

               const [promoteDoingToDone] = await connection.query(
                    queryPromoteDoingToDone,
                    [newNote, task_id]
               );

               if (promoteDoingToDone.affectedRows === 0) {
                    return res.json({
                         //transaction error
                         code: "D001",
                    });
               } else {
                    await nodemailer.sendMail(appInfo.app_permit_done, task_id);

                    return res.json({
                         //success
                         code: "S000",
                    });
               }
          }
     } catch (error) {
          return res.json({
               //uncaught server error
               code: "E004",
          });
     }
};
