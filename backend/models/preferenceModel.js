
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PreferencesSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  theme: { type: String, default: null },
  font: { type: String, default: null },
  layout: { type: String, default: null },
  active: { type: Boolean, required: true }
});

const Preferences = mongoose.model('Preferences', PreferencesSchema);

module.exports = Preferences;
