const express = require('express');
const router = express.Router();
const userRewardController = require('../controllers/userRewardController');
const auth = require('../middleware/authMiddleware');

router.post('/',auth, userRewardController.createUserReward);
router.get('/:id',auth, userRewardController.getUserRewardByUserId);
router.delete('/:id',auth, userRewardController.deleteUserReward);

module.exports = router;
