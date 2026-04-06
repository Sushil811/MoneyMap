import express from 'express'
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile, resetPassword} from '../controller/userController.js'
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/reset-password', resetPassword) // New route for direct reset

//protected routes
userRouter.get('/me', authMiddleware, getCurrentUser)
userRouter.put('/profile', authMiddleware, updateProfile)
userRouter.put('/password', authMiddleware, updatePassword)

export default userRouter