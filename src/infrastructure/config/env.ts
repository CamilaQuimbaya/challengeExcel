import dotenv from "dotenv";
dotenv.config();

export const env = {
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost/excelDB",
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost",
  PORT: parseInt(process.env.PORT || "3000", 10),
  UPLOADS_PATH: process.env.UPLOADS_PATH || "uploads/",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};
