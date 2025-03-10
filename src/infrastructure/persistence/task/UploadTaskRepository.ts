import UploadTaskModel from './UploadTaskModel';
import { ITaskRepository } from '../../../domain/repositories/ITaskRepository';
import { logger } from '../../../config/logger';

class UploadTaskRepository implements ITaskRepository {
    async create(task:any): Promise<string> {
       

        const uploadTask = new UploadTaskModel({
            status: task.status,
            filePath: task.filePath,
            errorCount: 0,
            newPeopleCount: 0
        });

        await uploadTask.save();
        logger.info(`✅ Task creada con ID: ${uploadTask._id.toString()}`);
        return uploadTask._id.toString();
    }

    async update(id: string, updates: any): Promise<void> {
        console.log(`🔍 Actualizando tarea en MongoDB:`, updates);
        await UploadTaskModel.findByIdAndUpdate(id, { ...updates });
        logger.info(`✅ Task ${id} actualizada con éxito.`);
    }

    async getById(id: string): Promise<any> {
        return UploadTaskModel.findById(id).lean();
    }

    async addOneErrorCount(id: string): Promise<void> {
        await UploadTaskModel.findByIdAndUpdate(id, { $inc: { errorCount: 1 } });
    }

    async addOneNewPeopleCount(id: string): Promise<void> {
        await UploadTaskModel.findByIdAndUpdate(id, { $inc: { newPeopleCount: 1 } });

    }
}

export default new UploadTaskRepository();
