import { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger";

export class ErrorHandler {
  static handle(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(`❌ Error: ${err.message}`);

    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
}
