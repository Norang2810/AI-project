const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cookieParser = require('cookie-parser');

try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using process env values');
}

const { sequelize } = require('./config/database');
const {
  allowedOrigins,
  uploadCorsOrigin,
  isOriginAllowed,
} = require('./config/runtime');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const menuRoutes = require('./routes/menu');
const geminiRoutes = require('./routes/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Environment configuration');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', PORT);
console.log('  - DB_HOST:', process.env.DB_HOST);
console.log('  - AI_SERVER_URL:', process.env.AI_SERVER_URL);
console.log('  - FRONTEND_ORIGIN:', process.env.FRONTEND_ORIGIN || '(not set)');
console.log(
  '  - CORS_ORIGINS:',
  allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '(allow all)'
);

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS policy blocked this origin'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  '/uploads',
  (req, res, next) => {
    const requestOrigin = req.headers.origin;
    const effectiveOrigin =
      uploadCorsOrigin || (isOriginAllowed(requestOrigin) ? requestOrigin : '');

    if (effectiveOrigin) {
      res.header('Access-Control-Allow-Origin', effectiveOrigin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return next();
  },
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
    },
  })
);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established');

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false, alter: true });
      console.log('Database schema synchronized');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    console.log('Starting server without database initialization');
  }
};

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/gemini', geminiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    database: 'MySQL',
    corsOrigins: allowedOrigins,
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong!',
    },
  });
});

const startServer = async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.log('Database init error ignored during boot:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
