const Preferences = require("../models/preferenceModel");
const mongoose = require("mongoose");

// CREATE - Dovoli le eno aktivno preference na uporabnika
exports.createPreferences = async (req, res) => {
  try {
    const { user_id, theme, font, layout, active } = req.body;

    // Če želimo to preference nastaviti kot aktivno
    if (active) {
      // Deaktiviraj vse ostale preference tega uporabnika
      await Preferences.updateMany({ user_id }, { active: false });
    }

    const newPreferences = new Preferences({
      user_id,
      theme,
      font,
      layout,
      active,
    });
    await newPreferences.save();
    res.status(201).json(newPreferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET ALL
exports.getPreferences = async (req, res) => {
  try {
    const preferences = await Preferences.find();
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET BY USER ID
exports.getPreferencesByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = await Preferences.find({
      user_id: mongoose.Types.ObjectId(id),
    });
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET BY ID
exports.getPreferencesById = async (req, res) => {
  try {
    const { id } = req.params;
    const preferences = await Preferences.findById(id);
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE - Če nastavljaš novo aktivno preference, deaktiviraj druge
exports.updatePreferences = async (req, res) => {
  try {
    const { active, user_id } = req.body;

    if (active) {
      // Deaktiviraj vse preference uporabnika pred aktivacijo nove
      await Preferences.updateMany({ user_id }, { active: false });
    }

    const preferences = await Preferences.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json(preferences);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE
exports.deletePreferences = async (req, res) => {
  try {
    const preferences = await Preferences.findByIdAndDelete(req.params.id);
    if (!preferences) {
      return res.status(404).json({ message: "Preferences not found" });
    }
    res.status(200).json({ message: "Preferences deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
