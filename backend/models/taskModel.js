const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  event_date: { type: Date, required: true },
  start_time: { type: String, default: null },
  end_time: { type: String, default: null },
  description: { type: String, default: null },
  category: {
    type: String,
    enum: ['work', 'school', 'sport', 'hobby', 'personal'],
    required: true,
  },
  reminder: { type: Date, default: null },
  notes: { type: String, default: null },
  status: {
    type: String,
    enum: ['started', 'completed'],
    default: 'started',
  },
  completed: { type: Boolean, default: false },
});

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;