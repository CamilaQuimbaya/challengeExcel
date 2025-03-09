import { Request, Response } from "express";
import { UploadTaskRepository } from "../../infrastructure/persistence/UploadTaskRepository";
import { queueService } from "../../application/QueueService";
import multer from "multer";
import path from "path";

const upload = multer({ dest: "uploads/" }); // Guardar archivos temporalmente

export class UploadController {
  static async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No se proporcionó ningún archivo." });
        return;
      }

      // Crear nueva tarea de carga en la BD
      const uploadTaskRepository = new UploadTaskRepository();
      const taskId = await uploadTaskRepository.createTask();

      // Enviar tarea a RabbitMQ para procesamiento
      await queueService.sendMessage({ taskId, filePath: req.file.path });

      res.status(202).json({ taskId, message: "Archivo recibido y en cola para procesamiento." });
    } catch (error) {
      res.status(500).json({ message: "Error en la carga del archivo", error });
    }
  }

  static async getTaskStatus(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const uploadTaskRepository = new UploadTaskRepository();
  
      console.log(`🔍 Buscando estado de la tarea con ID: ${taskId}`);
  
      const task = await uploadTaskRepository.getTask(taskId);
      console.log("📋 Resultado de la búsqueda en MongoDB:", task);
  
      if (!task) {
        console.log("❌ Tarea no encontrada en la base de datos.");
        res.status(404).json({ message: "Tarea no encontrada." });
        return;
      }
  
      res.status(200).json({
        taskId: task._id,
        status: task.status,
        errors: task.errorList || [],
      });
  
    } catch (error) {
      console.error("❌ Error obteniendo estado de la tarea:", error);
      res.status(500).json({ message: "Error obteniendo estado de la tarea", error });
    }
  }
  
}
