const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userManagement = require("../controllers/usermanagement");
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const checkGroup = require("../middlewares/checkGroup");
const checkActiveStatus = require("../middlewares/checkActiveStatus");
const apps = require("../controllers/apps");
const tasks = require("../controllers/tasks");
const plans = require("../controllers/plans");

//user
router.post("/auth/login", authController.login);
router.get("/logout", authController.logout);
router.get("/session", cookieJwtAuth.verifyToken, checkGroup.checkAccount);
router.post("/change", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, userManagement.updateProfile);

//usermanagement
router.get("/users", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, userManagement.loadUsers);
router.get("/groups", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, userManagement.loadGroups);
router.post("/create", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("ADMIN"), userManagement.createUser);
router.post("/creategroup", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("ADMIN"), userManagement.createGroup);
router.post("/update", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("ADMIN"), userManagement.updateUser);

//applist
router.get("/apps", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, apps.loadApps);
router.post("/createapp", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("PL"), apps.createApp);
router.post("/updateapp", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("PL"), apps.updateApp);
router.post("/app", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, apps.loadApp);

//planlist
router.post("/plans", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, plans.loadPlans);
router.post("/createplan", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkUserGroup("PM"), plans.createPlan);

//tasklist
router.post("/tasks", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, tasks.loadTasks);
router.post("/createtask", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.validatePermit, tasks.createTask);
router.post("/savechanges", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.validatePermit, tasks.saveChanges);
router.post("/promote", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.validatePermit, tasks.promoteTask);
router.post("/demote", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.validatePermit, tasks.demoteTask);
router.post("/permit", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkPermit);
router.post("/updatechange", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, tasks.loadTask);

module.exports = router;