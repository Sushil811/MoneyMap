import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import userRouter from './routes/userRoute.js';
import incomeRouter from './routes/incomeRoute.js';
import expenseRouter from './routes/expenseRouter.js';
import dashboardRouter from './routes/dashboardRoute.js';
import goalRouter from './routes/goalRoute.js';
import budgetRouter from './routes/budgetRoute.js';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';

// Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://moneymap-frontend-e6oy.onrender.com"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api/user', authLimiter);    // Strict limit on auth routes
app.use('/api', apiLimiter);          // General limit on all API routes

// DB
connectDB()

// Routes
app.use('/api/user', userRouter);
app.use('/api/income', incomeRouter);
app.use('/api/expense', expenseRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/goal', goalRouter);
app.use('/api/budget', budgetRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})