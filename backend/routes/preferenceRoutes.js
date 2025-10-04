const express = require("express");
const router = express.Router();
const preferencesController = require("../controllers/preferencesController");
const auth = require('../middleware/authMiddleware');

router.post("/",auth, preferencesController.createPreferences);
router.get("/:id",auth, preferencesController.getPreferencesByUserId);
router.put("/:id",auth, preferencesController.updatePreferences);
router.delete("/:id",auth, preferencesController.deletePreferences);
router.get("/single/:id",auth, preferencesController.getPreferencesById);

module.exports = router;
