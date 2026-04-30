const { Router } = require('express');
const apiController = require('../controllers/apiController');
const jwtAuth = require('../middleware/jwtAuth');

const router = Router();

// TODO: POST /login  → apiController.login
// TODO: GET  /records → jwtAuth, apiController.getRecords

module.exports = router;
