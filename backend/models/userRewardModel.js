
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserRewardSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reward_id: { type: Schema.Types.ObjectId, ref: 'Reward', required: true },
  earned_at: { type: Date, default: Date.now }
});

const UserReward = mongoose.model('UserReward', UserRewardSchema);

module.exports = UserReward;
