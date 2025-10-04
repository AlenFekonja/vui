const Reward = require('../models/rewardModel');

exports.createReward = async (req, res) => {
  try {
    const { level_required, name, description, condition_required } = req.body;
    const newReward = new Reward({ level_required, name, description, condition_required });
    await newReward.save();
    res.status(201).json(newReward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.status(200).json(rewards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRewardById = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.status(200).json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.status(200).json(reward);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.status(200).json({ message: 'Reward deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};