// Import dependencies
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
dotenv.config();

// Import module
import route from './routes';
import { connect as dbConnect } from './config/database';
import { requestLogger } from './middleware/requestLogger';
import logger from './utils/logger';

// Import Clean Architecture setup
import { setupServices } from './infrastructure/di/serviceRegistry';

// Import Swagger setup
import { setupSwagger } from './docs/swagger.config';

// Connect to DB and setup Clean Architecture
async function initializeApp() {
  try {
    // Connect to database
    await dbConnect();
    logger.info('Connected to MongoDB', { module: 'Database' });

    // Setup Clean Architecture services
    await setupServices();
    logger.info('Clean Architecture services initialized', { module: 'DI' });
  } catch (err: any) {
    logger.error('Failed to initialize application', {
      module: 'Initialization',
      details: { error: err.message, stack: err.stack },
    });
    process.exit(1);
  }
}

// Initialize application
initializeApp();

const port: number = parseInt(process.env.PORT || '3000', 10);
const app: Express = express();

// Middleware for logging HTTP requests
// Morgan for development style logging
// Custom request logger for structured logging
app.use(requestLogger);

// Sử dụng CORS cho tất cả các route
app.use(cors());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

// Setup Swagger documentation
setupSwagger(app);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled application error', {
    module: 'Express',
    details: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    },
  });

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// route init
route(app);

app.listen(port, () => {
  logger.info(`Server started successfully`, {
    module: 'Server',
    details: { port, url: `http://localhost:${port}` },
  });
});

// Cuối file, thêm dòng này:
export default app;
// Handle process termination
process.on('SIGINT', () => {
  logger.info('Server shutting down', { module: 'Server' });
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    module: 'Process',
    details: { error: error.message, stack: error.stack },
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', {
    module: 'Process',
    details: { reason, promise },
  });
});
