const { Router } = require('express');
const recordController = require('../controllers/recordController');
const sessionAuth = require('../middleware/sessionAuth');

const router = Router();

router.get('/dashboard', sessionAuth, recordController.getDashboard);
router.get('/records/new', sessionAuth, recordController.getAddRecord);
router.post('/records', sessionAuth, recordController.postAddRecord);
router.get('/records/:id/edit', sessionAuth, recordController.getEditRecord);
router.post('/records/:id', sessionAuth, recordController.postUpdateRecord);
router.post('/records/:id/delete', sessionAuth, recordController.deleteRecord);
router.get('/stats', sessionAuth, recordController.getStats);

module.exports = router;
