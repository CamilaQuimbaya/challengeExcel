import "express-async-errors"; // Asegurar que esto esté al inicio del archivo
import express from "express";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { ErrorHandler } from "./interfaces/middlewares/ErrorHandler";
import { logger } from "./config/logger";
import routes from "./interfaces/routes/routes"; // ✅ Importar rutas correctamente
import { setupSwagger } from "./config/swager";

const app = express();
app.use(express.json());

// ✅ Conectar a MongoDB
connectDatabase();


// ✅ Registrar rutas
app.use("/api", routes); // Esto permite acceder a /api/upload y /api/tasks/:taskId


// Configurar Swagger
setupSwagger(app);


// Middleware para manejar rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});


// Middleware global de manejo de errores
app.use(ErrorHandler.handle);



app.listen(env.PORT, () => logger.info(`🚀 Server running on port ${env.PORT}`));
