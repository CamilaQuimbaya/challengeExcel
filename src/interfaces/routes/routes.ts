import { Request, Response } from "express";
import { IUploadTaskRepository } from "../../domain/repositories/IUploadTaskRepository";

export class UploadController {
  constructor(private repository: IUploadTaskRepository) {}

  async uploadFile(req: Request, res: Response) {
    try {
      const taskId = await this.repository.createTask();
      res.status(202).json({ taskId, message: "Tarea de carga creada exitosamente." });
    } catch (error) {
      res.status(500).json({ error: "Error al crear la tarea de carga", details: (error as Error).message });
    }
  }

  async getTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await this.repository.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }
      res.json({ taskId: id, status: task.status, errors: task.errors });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el estado de la tarea", details: (error as Error).message });
    }
  }
}