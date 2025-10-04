const express = require('express');
const router = express.Router();
const notifsController = require('../controllers/notifs');

router.post('/', notifsController.sendNotification);

module.exports = router;
