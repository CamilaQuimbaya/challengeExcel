import UploadTaskModel from '../persistence/UploadTaskModel';
import { IUploadTaskRepository } from '../../domain/repositories/IUploadTaskRepository';

class UploadTaskRepository implements IUploadTaskRepository {
  async createTask(mapping: any, filePath: string, processedData: any): Promise<string> {
    if (!mapping) {
        throw new Error("Mapping is required to create a task");
    }

    const uploadTask = new UploadTaskModel({
        status: 'pending',
        errorList: [],
        mapping,
        filePath,
        processedData,  // ✅ Guardamos los datos convertidos
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await uploadTask.save();
    return uploadTask._id.toString();
}



    async updateTask(id: string, updates: any): Promise<void> {
        await UploadTaskModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() });
    }

    async getTask(id: string): Promise<any> {
        return UploadTaskModel.findById(id).lean();
    }
}

export default new UploadTaskRepository();