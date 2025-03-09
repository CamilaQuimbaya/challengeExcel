import { queueService } from "../../application/QueueService";
import { UploadTaskRepository } from "../persistence/UploadTaskRepository";
import { logger } from "../../config/logger";
import fs from "fs";
import { ExcelProcessor } from "../../application/ExcelProcessor";
import mongoose from "mongoose";
import { connectDatabase } from "../../config/database";

export class TaskProcessor {
  static async processTask(taskId: string, filePath: string): Promise<void> {
    try {
        // ✅ Verificar conexión a MongoDB antes de continuar
        if (mongoose.connection.readyState !== 1) {
            throw new Error("❌ MongoDB no está conectado. No se pueden procesar tareas.");
        }

        const uploadTaskRepository = new UploadTaskRepository();
        logger.info(`🛠️ Iniciando procesamiento de la tarea: ${taskId}`);

        const task = await uploadTaskRepository.getTask(taskId);
        if (!task) {
            throw new Error(`❌ No se encontró la tarea con ID: ${taskId}`);
        }

        logger.info(`📄 Tarea encontrada en MongoDB: ${JSON.stringify(task)}`);

        await uploadTaskRepository.updateTaskStatus(taskId, "processing");
        logger.info(`🔄 Estado de la tarea actualizado a 'processing' en MongoDB`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`❌ El archivo no existe en la ruta: ${filePath}`);
        }

        logger.info(`📂 Archivo encontrado: ${filePath}`);
        const fileBuffer = fs.readFileSync(filePath);

        const { data, errors } = await ExcelProcessor.parseExcel(fileBuffer);
        logger.info(`📊 Archivo procesado: ${data.length} filas, ${errors.length} errores`);

        await uploadTaskRepository.updateTaskErrors(taskId, errors);
        logger.info(`📋 Se guardaron ${errors.length} errores en la base de datos`);

        await uploadTaskRepository.saveProcessedData(taskId, data);
        logger.info(`💾 Se guardaron los datos procesados en la base de datos`);

        await uploadTaskRepository.updateTaskStatus(taskId, "done");
        logger.info(`✅ Estado de la tarea actualizado a 'done' en MongoDB`);

        await queueService.sendMessage({ taskId, status: "done" });
        logger.info(`📩 Notificación enviada a RabbitMQ: tarea ${taskId} marcada como 'done'`);

        fs.unlinkSync(filePath);
        logger.info(`🗑️ Archivo eliminado: ${filePath}`);
    } catch (error) {
        logger.error(`❌ Error procesando la tarea ${taskId}:`, error);
        const uploadTaskRepository = new UploadTaskRepository();
        await uploadTaskRepository.updateTaskStatus(taskId, "error");
    }
}

    static async startConsumer(): Promise<void> {
        logger.info("🚀 Iniciando el consumidor de tareas...");
        await queueService.connect();

        queueService.consumeMessages(async (message, rawMsg) => {
            try {
                logger.info(`📩 Mensaje recibido en la cola: ${JSON.stringify(message)}`);

                const { taskId, filePath } = message as { taskId: string; filePath: string };

                if (!taskId || typeof taskId !== "string") {
                    throw new Error("❌ El mensaje recibido no contiene un taskId válido.");
                }

                if (!filePath || typeof filePath !== "string") {
                    throw new Error("❌ El mensaje recibido no contiene un filePath válido.");
                }

                await TaskProcessor.processTask(taskId, filePath);

                // ✅ Confirmamos el mensaje para RabbitMQ
                queueService.getChannel()?.ack(rawMsg);
                logger.info(`📤 Mensaje confirmado con ack(): ${taskId}`);

                logger.info("🔄 Esperando el siguiente mensaje...");
            } catch (error) {
                logger.error("❌ Error procesando mensaje de RabbitMQ:", error);
            }
        });
    }
}

// ✅ Llamar a connectDatabase antes de iniciar el consumidor
connectDatabase().then(() => {
  if (require.main === module) {
      TaskProcessor.startConsumer().catch((err) => {
          logger.error("❌ Error al iniciar el consumidor de tareas:", err);
      });
  }
});