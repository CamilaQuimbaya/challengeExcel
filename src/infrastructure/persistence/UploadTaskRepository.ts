import { IUploadTaskRepository } from "../../domain/repositories/IUploadTaskRepository";
import { UploadTaskModel } from "./UploadTaskModel";

export class UploadTaskRepository implements IUploadTaskRepository {
  async createTask(): Promise<string> {
    const task = new UploadTaskModel();
    await task.save();
    return task.id;
  }

  async updateTask(id: string, updates: any): Promise<void> {
    await UploadTaskModel.findByIdAndUpdate(id, updates);
  }

  async getTask(id: string): Promise<any> {
    return UploadTaskModel.findById(id);
  }
}
