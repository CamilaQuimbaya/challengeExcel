import { IUploadTaskRepository } from "../../domain/repositories/IUploadTaskRepository";
import { UploadTaskModel } from "./UploadTaskModel";

export class UploadTaskRepository implements IUploadTaskRepository {
  
  async createTask(): Promise<string> {
    const task = new UploadTaskModel({ status: "pending", errors: [] });
    await task.save();
    return task.id;
  }

  async getTask(taskId: string): Promise<any> {
    return await UploadTaskModel.findById(taskId);
  }

  async updateTask(id: string, updates: any): Promise<void> {
    await UploadTaskModel.findByIdAndUpdate(id, { $set: updates });
  }

  async updateTaskStatus(taskId: string, status: "pending" | "processing" | "done" | "error"): Promise<void> {
    await this.updateTask(taskId, { status });
  }

  async updateTaskErrors(taskId: string, errors: { row: number; col: number }[]): Promise<void> {
    await this.updateTask(taskId, { errorList: errors });
  }

  async saveProcessedData(taskId: string, data: any[]): Promise<void> {
    await this.updateTask(taskId, { data });
  }
}
