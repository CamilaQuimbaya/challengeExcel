import { Request, Response } from "express";
import { UploadTaskRepository } from "../../infrastructure/persistence/UploadTaskRepository";

export class UploadController {
  private repository: UploadTaskRepository;

  constructor() {
    this.repository = new UploadTaskRepository();
  }

  async uploadFile(req: Request, res: Response) {
    try {
      const taskId = await this.repository.createTask();
      res.status(202).json({ taskId });
    } catch (error) {
      res.status(500).json({ error: "Error al crear la tarea de carga" });
    }
  }

  async getTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await this.repository.getTask(id);
      if (!task) {
        return res.status(404).json({ error: "Tarea no encontrada" });
      }
      res.json({ status: task.status, errors: task.errors });
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el estado de la tarea" });
    }
  }
}
