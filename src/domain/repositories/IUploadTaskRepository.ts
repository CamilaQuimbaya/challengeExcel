export interface IUploadTaskRepository {
  createTask(): Promise<string>;
  updateTask(id: string, updates: any): Promise<void>;
  getTask(id: string): Promise<any>;
}
