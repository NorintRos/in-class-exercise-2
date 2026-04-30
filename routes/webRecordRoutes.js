const { Router } = require('express');
const recordController = require('../controllers/recordController');
const sessionAuth = require('../middleware/sessionAuth');

const router = Router();

// TODO: apply sessionAuth to all routes below
// TODO: wire up GET /dashboard, GET /records/new, POST /records,
//       GET /records/:id/edit, POST /records/:id, POST /records/:id/delete,
//       GET /stats

module.exports = router;
