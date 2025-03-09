import RabbitMQService from './RabbitMQService';
import { connectDatabase } from '../../config/database';
import UploadTaskRepository from '../persistence/UploadTaskRepository';
import { logger } from '../../config/logger';

async function processTaskMessage(msg: any) {
  if (!msg) return;

  try {
    const { taskId } = JSON.parse(msg.content.toString());
    logger.info(`📨 Received message from queue:`, { taskId });

    const task = await UploadTaskRepository.getTask(taskId);
    if (!task) {
      logger.error(`❌ Task not found with ID ${taskId}`);
      return;
    }

    if (!task.filePath) {
      logger.error(`❌ Task ${taskId} has no assigned filePath.`);
      return;
    }

    logger.info(`🛠️ Processing file: ${task.filePath}`);
    
    // Aquí iría la lógica real de procesamiento del archivo

    await UploadTaskRepository.updateTask(taskId, { status: 'done' });
    logger.info(`✅ Task status updated to 'done' in MongoDB`);
  } catch (error) {
    logger.error(`❌ Error processing message: ${error instanceof Error ? error.message : error}`);
  }
}

async function startTaskProcessor() {
  await connectDatabase();
  await RabbitMQService.consumeMessages(processTaskMessage);
}

startTaskProcessor();
