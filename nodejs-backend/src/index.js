/**
 * Main Application Entry Point
 * Express server with FN7 SDK integration
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getSDK } = require('./sdk');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Middleware to extract authContext (JWT token) from Authorization header (optional in local mode)
 * Token format: "Bearer <token>"
 *
 * SDK automatically uses hardcoded dev token if no token provided.
 */
function extractAuthContext(req, res, next) {
  const authHeader = req.headers.authorization;

  // In local mode, authContext is optional - SDK will use hardcoded dev token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authContext = undefined; // SDK will handle this in local mode
    next();
    return;
  }

  // Extract token and attach to request object
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  req.authContext = token;
  next();
}

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

// Initialize SDK
let sdk;
try {
  sdk = getSDK();
} catch (error) {
  console.error('Failed to initialize SDK:', error);
  process.exit(1);
}

// Routes

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /users/:userId
 * Get user data
 */
app.get('/users/:userId', extractAuthContext, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const authContext = req.authContext;

    const userData = await sdk.getFirebaseData('Users', userId, authContext);
    res.json(userData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /users/:userId
 * Create user data
 */
app.post('/users/:userId', extractAuthContext, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { data } = req.body;
    const authContext = req.authContext;

    const result = await sdk.createFirebaseData('Users', userId, data, authContext);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /users/:userId
 * Update user data
 */
app.put('/users/:userId', extractAuthContext, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { data } = req.body;
    const authContext = req.authContext;

    const result = await sdk.updateFirebaseData('Users', userId, data, authContext);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /users/:userId
 * Delete user data
 */
app.delete('/users/:userId', extractAuthContext, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const authContext = req.authContext;

    await sdk.deleteFirebaseData('Users', userId, authContext);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * POST /storage/upload
 * Upload files to Firebase Storage
 */
app.post('/storage/upload', extractAuthContext, async (req, res, next) => {
  try {
    // Note: This is a simplified example
    // In production, you'd handle file uploads using multer or similar
    const { fileNames, fileBuffers, folder } = req.body;
    const authContext = req.authContext;

    const urls = await sdk.uploadToStorage(fileNames, fileBuffers, folder || 'uploads', authContext);
    res.json({ urls });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

