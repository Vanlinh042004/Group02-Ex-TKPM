// Import dependencies
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Import module
import route from "./routes";
import { connect as dbConnect } from "./config/database";
import { requestLogger } from "./middleware/requestLogger";
import logger from "./utils/logger";

// Import i18n
import { 
  i18nMiddleware, 
  enhanceI18nMiddleware, 
  languageSwitchMiddleware,
  validateI18nMiddleware 
} from './middleware/i18n';

// Connect to DB
dbConnect()
  .then(() => {
    logger.info("Connected to MongoDB", { module: "Database" });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", {
      module: "Database",
      details: { error: err.message, stack: err.stack },
    });
    process.exit(1);
  });

const port: number = parseInt(process.env.PORT || "3000", 10);
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
  }),
);

app.use(express.json());

// I18next middleware stack
app.use(i18nMiddleware); // Core i18next middleware for language detection
app.use(enhanceI18nMiddleware); // Add convenience methods
app.use(languageSwitchMiddleware); // Handle ?lang= parameter
app.use(validateI18nMiddleware); // Validate translations are working

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("Unhandled application error", {
    module: "Express",
    details: {
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    },
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// route init
route(app);

app.listen(port, () => {
  logger.info(`Server started successfully`, {
    module: "Server",
    details: { port, url: `http://localhost:${port}` },
  });
});

// Cuối file, thêm dòng này:
export default app;
// Handle process termination
process.on("SIGINT", () => {
  logger.info("Server shutting down", { module: "Server" });
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", {
    module: "Process",
    details: { error: error.message, stack: error.stack },
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled promise rejection", {
    module: "Process",
    details: { reason, promise },
  });
});
