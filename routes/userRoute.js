import express from 'express';
import { createUser, getUsers, getUserById, updateUser, deleteUser, loginAdmin } from '../controllers/userController.js';
const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

// User CRUD routes
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
