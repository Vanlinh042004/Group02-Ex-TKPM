import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // Log at the start of the request
  logger.debug(`Incoming request ${method} ${url}`, {
    module: "HTTP",
    operation: method,
    details: {
      ip,
      userAgent: req.headers["user-agent"],
      params: req.params,
      query: req.query,
    },
  });

  // When the response is finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const logLevel = statusCode >= 400 ? "warn" : "info";

    logger[logLevel](`${method} ${url} ${statusCode} - ${duration}ms`, {
      module: "HTTP",
      operation: method,
      details: {
        statusCode,
        duration,
        ip,
      },
    });
  });

  // Pass control to the next middleware
  next();
};
