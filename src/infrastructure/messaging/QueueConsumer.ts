import RabbitMQService from '../../infrastructure/messaging/RabbitMQService';
import { logger } from '../../config/logger';
import TaskService from '../../application/TaskService';
import { connectDatabase } from '../../config/database'; // Agregar conexión a MongoDB

async function QueueConsumer(msg: any) {
    try {
        const { taskId } = JSON.parse(msg.content.toString());
        if (!taskId) return;

        logger.info(`📨 Received task: ${taskId}, processing...`);

        // Asegurar conexión antes de procesar
        await connectDatabase();

        await TaskService.processTask(taskId);
    } catch (error) {
        logger.error(`❌ Error in QueueConsumer: ${error instanceof Error ? error.message : error}`);
    }
}

async function startTaskProcessor() {
    try {
        logger.info('🚀 Starting Task Processor...');
        await connectDatabase(); // Asegurar conexión antes de consumir mensajes
        await RabbitMQService.consumeMessages(QueueConsumer);
    } catch (error) {
        logger.error(`❌ Error starting task processor: ${error instanceof Error ? error.message : error}`);
    }
}

startTaskProcessor();
