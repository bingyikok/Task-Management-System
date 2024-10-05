const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loadUsers = require("../controllers/loadUsers");
const createNewUser = require("../controllers/createNewUser");
const createNewGroup = require("../controllers/createNewGroup");
const loadGroups = require("../controllers/loadGroups");
const updateUser = require("../controllers/updateUser");
const cookieJwtAuth = require("../utils/cookieJwtAuth");
const updateProfile = require("../controllers/updateProfile");
const checkGroup = require("../utils/checkGroup");
const checkActiveStatus = require("../utils/checkActiveStatus");

router.post("/auth/login", authController.login);
router.get("/session", cookieJwtAuth.verifyToken, checkGroup.checkAccount);
router.get("/users", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, loadUsers.load);
router.get("/groups", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, loadGroups.load);
router.post("/create", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkIsAdmin, createNewUser.create);
router.post("/creategroup", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkIsAdmin, createNewGroup.create);
router.post("/update", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, checkGroup.checkIsAdmin, updateUser.update);
router.post("/change", cookieJwtAuth.verifyToken, checkActiveStatus.checkActiveStatus, updateProfile.update);
router.get("/logout", authController.logout);

module.exports = router;