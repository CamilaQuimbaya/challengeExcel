import { logger } from '../config/logger';
import UploadTaskRepository from '../infrastructure/persistence/UploadTaskRepository';
import ExcelProcessor from '../application/ExcelProcessor';
import ExcelValidator from '../application/ExcelValidator';
import QueueService from './QueueService';

class TaskService {
    async startTask(filePath: string, mapping: Record<string, 'String' | 'Number' | 'Array<Number>'>) {
        const taskId = await UploadTaskRepository.createTask(mapping, filePath, []);
    
        console.log(`✅ TaskService: Tarea creada con ID: ${taskId}`);
    
        console.log('📩 Enviando mensaje a RabbitMQ...');
        await QueueService.sendMessage(taskId);
        
        console.log('✅ Mensaje enviado correctamente a RabbitMQ.');
    
        return { id: taskId };
    }
    

    async processTask(taskId: string) {
        try {
            logger.info(`📨 Processing task: ${taskId}`);
            const task = await UploadTaskRepository.getTask(taskId);
            if (!task) throw new Error(`Task ${taskId} not found`);
    
            const { mapping, filePath } = task;
            const rows = ExcelProcessor.readFile(filePath);
            
            const headers = rows.shift();
            if (!headers) throw new Error('Empty file or invalid format');
    
            let errors: { row: number; col: number; error: string }[] = [];
            let processedData: any[] = [];
    
            rows.forEach((row, rowIndex) => {
                const validationErrors = ExcelValidator.validateRow(row, headers, mapping, rowIndex + 1);
                if (validationErrors.length > 0) {
                    errors.push(...validationErrors);
                } else {
                    const obj: any = {};
                    headers.forEach((header, colIndex) => {
                        const type = mapping[header as keyof typeof mapping];
                        const cellValue = row[colIndex];
                        if (type === 'Number') {
                            obj[header] = Number(cellValue);
                        } else if (type === 'String') {
                            obj[header] = String(cellValue || '');
                        } else if (type === 'Array<Number>') {
                            obj[header] = cellValue.split(',').map((num: string) => Number(num.trim())).filter((n: number) => !isNaN(n)).sort((a: number, b: number) => a - b);
                        }
                    });
                    processedData.push(obj);
                }
            });
    
            console.log(`🔍 Errores detectados antes de guardar en DB:`, errors);
    
            await UploadTaskRepository.updateTask(taskId, { status: 'done', processedData, errors });
            logger.info(`✅ Task ${taskId} completed with ${errors.length} errors.`);
        } catch (error) {
            logger.error(`❌ Error processing task: ${error instanceof Error ? error.message : error}`);
            await UploadTaskRepository.updateTask(taskId, { status: 'failed' });
        }
    }
}    

export default new TaskService();