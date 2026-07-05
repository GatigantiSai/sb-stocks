const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getAllUsers,
  toggleUserSuspension,
  deleteUser,
  createStock,
  updateStock,
  deleteStock
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Require authentication and admin rights for all routes
router.use(protect, admin);

router.get('/analytics', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleUserSuspension);
router.delete('/users/:id', deleteUser);

router.post('/stocks', createStock);
router.put('/stocks/:id', updateStock);
router.delete('/stocks/:id', deleteStock);

module.exports = router;
