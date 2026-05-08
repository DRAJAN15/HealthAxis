const express = require('express');
const router = express.Router();
const { createRecord, getRecords, getRecord, updateRecord } = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',    protect, authorize('doctor'), createRecord);
router.get('/',     protect, getRecords);
router.get('/:id',  protect, getRecord);
router.put('/:id',  protect, authorize('doctor'), updateRecord);

module.exports = router;
