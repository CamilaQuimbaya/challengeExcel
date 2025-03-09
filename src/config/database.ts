import mongoose from "mongoose";
import { logger } from "./logger";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/excelDB";

export const connectDatabase = async () => {
    try {
        logger.info("🔄 Intentando conectar a MongoDB...");
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 30000, // 30s para encontrar un servidor
            socketTimeoutMS: 60000, // 60s antes de cerrar la conexión
        });
        logger.info("✅ MongoDB Connected");
    } catch (error) {
        logger.error("❌ Error al conectar a MongoDB:", error);
        process.exit(1); // Detiene el proceso si no puede conectarse
    }
};

// Reintentar conexión si se desconecta
mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️ MongoDB desconectado. Intentando reconectar en 5s...");
    setTimeout(connectDatabase, 5000);
});
