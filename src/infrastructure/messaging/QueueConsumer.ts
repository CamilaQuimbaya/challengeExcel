import RabbitMQService from './RabbitMQService';
import { connectDatabase } from '../../config/database';
import UploadTaskRepository from '../persistence/UploadTaskRepository';
import { logger } from '../../config/logger';
import xlsx from 'xlsx';
import TaskService from '../../application/TaskService';

async function QueueConsumer(msg: any) {
    const { taskId } = JSON.parse(msg.content.toString());
    if(!taskId) return;

    await TaskService.processTask(taskId);
    
}

async function startTaskProcessor() {
    await connectDatabase();
    await RabbitMQService.consumeMessages(QueueConsumer);
}

startTaskProcessor();
