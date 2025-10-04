const UserReward = require('../models/userRewardModel');
const mongoose = require('mongoose');
exports.createUserReward = async (req, res) => {
  try {
    const { user_id, reward_id, earned_at } = req.body;
    const newUserReward = new UserReward({ user_id, reward_id, earned_at });
    await newUserReward.save();
    res.status(201).json(newUserReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserRewards = async (req, res) => {
  try {
    const userRewards = await UserReward.find({ user_id: req.params.user_id }.populate('reward_id'));
    res.status(200).json(userRewards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserRewardById = async (req, res) => {
  try {
    const userReward = await UserReward.findById(req.params.id).populate('user_id reward_id');
    if (!userReward) {
      return res.status(404).json({ message: 'User Reward not found' });
    }
    res.status(200).json(userReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserRewardByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    const userReward = await UserReward.find({ user_id: mongoose.Types.ObjectId(id) }).populate('reward_id');
    if (!userReward) {
      return res.status(404).json({ message: 'User Reward not found' });
    }
    res.status(200).json(userReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUserReward = async (req, res) => {
  try {
    const userReward = await UserReward.findByIdAndDelete(req.params.id);
    if (!userReward) {
      return res.status(404).json({ message: 'User Reward not found' });
    }
    res.status(200).json({ message: 'User Reward deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};