import UploadTaskModel from '../persistence/UploadTaskModel';
import { IUploadTaskRepository } from '../../domain/repositories/IUploadTaskRepository';
import { logger } from '../../config/logger';

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
            processedData,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await uploadTask.save();
        logger.info(`✅ Task creada con ID: ${uploadTask._id.toString()}`);
        return uploadTask._id.toString();
    }

    async updateTask(id: string, updates: any): Promise<void> {
        console.log(`🔍 Actualizando tarea en MongoDB:`, updates);
        await UploadTaskModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() });
        logger.info(`✅ Task ${id} actualizada con éxito.`);
    }

    async getTask(id: string): Promise<any> {
        return UploadTaskModel.findById(id).lean();
    }
}

export default new UploadTaskRepository();
