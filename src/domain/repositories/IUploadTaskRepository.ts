export interface IUploadTaskRepository {
  createTask(mapping: any, filePath: string, processedData: any): Promise<string>; // ✅ Ahora acepta processedData
  updateTask(id: string, updates: any): Promise<void>;
  getTask(id: string): Promise<any>;
}
