
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RewardSchema = new Schema({
  level_required: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  condition_required: { type: String, default: null }
});

const Reward = mongoose.model('Reward', RewardSchema);

module.exports = Reward;
