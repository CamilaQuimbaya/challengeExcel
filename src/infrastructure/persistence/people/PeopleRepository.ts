import PersonModel from './PeopleModel';
import { IRepository } from '../../../domain/repositories/IRepository';
import { logger } from '../../../config/logger';
import PeopleModel from './PeopleModel';

class PeopleRepository implements IRepository {
    async create(person:any): Promise<string> {
       
        const Person = new PeopleModel({
            name: person.name,
            age: person.age,
            nums: person.nums,
            taskId: person.taskId,
        });

        await Person.save();
        logger.info(`✅ Task creada con ID: ${Person._id.toString()}`);
        return Person._id.toString();
    }

    async update(id: string, updates: any): Promise<void> {
        console.log(`🔍 Actualizando tarea en MongoDB:`, updates);
        await PersonModel.findByIdAndUpdate(id, { ...updates });
        logger.info(`✅ Task ${id} actualizada con éxito.`);
    }

    async getById(id: string): Promise<any> {
        return PersonModel.findById(id).lean();
    }

    async getByTaskId(taskId: string): Promise<any[]> {
        return PeopleModel.find({ taskId }).lean();
    }
    
}

export default new PeopleRepository();
