const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpLogSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  reason: { type: String, default: 'Task completed' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExpLog', ExpLogSchema);