import RabbitMQService from '../infrastructure/messaging/RabbitMQService';
import UploadTaskRepository from '../infrastructure/persistence/UploadTaskRepository';

interface MappingFormat {
    [key: string]: 'String' | 'Number' | 'Array<Number>';
}

class ExcelProcessor {
    async processFile(filePath: string, mapping: MappingFormat) {
        const taskId = await UploadTaskRepository.createTask(mapping, filePath, []);

        await RabbitMQService.publishMessage(JSON.stringify({ taskId, filePath, mapping }));

        return { id: taskId };
    }
}

export default new ExcelProcessor();
