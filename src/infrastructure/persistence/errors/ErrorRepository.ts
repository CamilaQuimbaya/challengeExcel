import errorModel from './ErrorModel';
import { IRepository } from '../../../domain/repositories/IRepository';
import { logger } from '../../../config/logger';

class ErrorRepository implements IRepository {
    async create(error:any): Promise<string> {
        const errorCreate = new errorModel({
            row: error.row,
            taskId: error.taskId,

            ...(error.nameError && { nameError: error.nameError}),
            ...(error.ageError && { ageError: error.ageError}),
            ...(error.numsError && { numsError: error.numsError}),
        });

        await errorCreate.save();
        logger.info(`✅ Task creada con ID: ${errorCreate._id.toString()}`);
        return errorCreate._id.toString();
    }

    async update(id: string, updates: any): Promise<void> {
        console.log(`🔍 Actualizando tarea en MongoDB:`, updates);
        await errorModel.findByIdAndUpdate(id, { ...updates});
        logger.info(`✅ Task ${id} actualizada con éxito.`);
    }

    async getById(id: string): Promise<any> {
        return errorModel.findById(id).lean();
    }
}

export default new ErrorRepository();
