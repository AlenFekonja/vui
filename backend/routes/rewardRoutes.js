const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const auth = require('../middleware/authMiddleware');

router.post('/',auth, rewardController.createReward);
router.get('/',auth, rewardController.getRewards);
router.get('/:id',auth, rewardController.getRewardById);
router.put('/:id',auth, rewardController.updateReward);
router.delete('/:id',auth, rewardController.deleteReward);

module.exports = router;
