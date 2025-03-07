import "express-async-errors"; // Asegúrate de que esto esté al inicio del archivo

import express from "express";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { ErrorHandler } from "./interfaces/middlewares/ErrorHandler";
import { logger } from "./config/logger";

const app = express();
app.use(express.json());

connectDatabase(); // Conectar a MongoDB

app.use(ErrorHandler.handle); // Middleware de errores

app.listen(env.PORT, () =>
  logger.info(`🚀 Server running on port ${env.PORT}`)
);
