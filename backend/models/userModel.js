
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  two_factor_enabled: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  admin: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
