const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.post('/', userController.createUser);
router.get('/',auth, userController.getUsers);
router.get('/:id',auth, userController.getUserById);
router.put('/:id',auth, userController.updateUser);
router.delete('/:id',auth, userController.deleteUser);

router.post('/login', userController.Login);
router.post('/refresh', userController.Refresh);
router.post('/protected', userController.Protected);

router.put('/admin/:id',auth, userController.updateUserAdminStatus);

module.exports = router;
