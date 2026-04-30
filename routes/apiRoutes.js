const { Router } = require("express");
const apiController = require("../controllers/apiController");
const jwtAuth = require("../middleware/jwtAuth");

const router = Router();

router.post("/login", apiController.login);
router.get("/records", jwtAuth, apiController.getRecords);

module.exports = router;
