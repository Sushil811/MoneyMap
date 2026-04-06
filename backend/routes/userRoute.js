import express from 'express'
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile, forgotPassword, resetPassword} from '../controller/userController.js'
import { authMiddleware } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)

//protected routes
userRouter.get('/me', authMiddleware, getCurrentUser)
userRouter.put('/profile', authMiddleware, updateProfile)
userRouter.put('/password', authMiddleware, updatePassword)
userRouter.post('/forgot-password', forgotPassword)
userRouter.put('/reset-password/:token', resetPassword)

export default userRouter