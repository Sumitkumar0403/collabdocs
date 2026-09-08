import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env';
import apiRouter from './routes';
import { errorHandler, AppError } from './middleware/errorHandler';

export const app = express();

// Security HTTP headers configured to allow cross-origin API and static asset access
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Regex matching any local development port (localhost or 127.0.0.1)
const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin or when CLIENT_URL is wildcard '*'
    if (!origin || ENV.CLIENT_URL === '*' || origin === ENV.CLIENT_URL || localhostRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing with safe size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Rate limiting on auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);

// Mount main API
app.use('/api', apiRouter);

// Serve static frontend in production if client/dist exists
import path from 'path';
import fs from 'fs';

const possibleDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];
const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(new AppError('Endpoint not found', 404));
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 handler for unmatched routes when running API standalone
  app.use((_req, _res, next) => {
    next(new AppError('Endpoint not found', 404));
  });
}

// Central error handler
app.use(errorHandler);

// Start server if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 CollabDocs server running at http://localhost:${ENV.PORT}`);
    console.log(`📡 Accepting client requests from: ${ENV.CLIENT_URL}`);
  });
}
