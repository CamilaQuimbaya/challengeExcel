import amqp from 'amqplib';
import { connectDatabase } from '../../config/database';
import UploadTaskRepository from '../persistence/UploadTaskRepository';
import { logger } from '../../config/logger';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'upload_tasks';

async function startTaskProcessor() {
  await connectDatabase();

  try {
    logger.info(`🔄 Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    logger.info(`✅ Connected to RabbitMQ and queue asserted`);

    channel.consume(QUEUE_NAME, async (msg) => {
      if (!msg) return;

      try {
        const { taskId } = JSON.parse(msg.content.toString());
        logger.info(`📨 Received message from queue:`, { taskId });

        const task = await UploadTaskRepository.getTask(taskId);
        if (!task) {
          logger.error(`❌ Task not found with ID ${taskId}`);
          channel.ack(msg);
          return;
        }

        if (!task.filePath) {
          logger.error(`❌ Task ${taskId} has no assigned filePath.`);
          channel.ack(msg);
          return;
        }

        logger.info(`🛠️ Processing file: ${task.filePath}`);
        
        // Aquí iría la lógica real de procesamiento del archivo

        await UploadTaskRepository.updateTask(taskId, { status: 'done' });
        logger.info(`✅ Task status updated to 'done' in MongoDB`);

        channel.ack(msg);
      } catch (error) {
        logger.error(`❌ Error processing message: ${error instanceof Error ? error.message : error}`);
        channel.nack(msg, false, false);
      }
    });

    process.on('SIGINT', async () => {
      logger.info('🛑 Closing RabbitMQ connection...');
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error(`❌ Error connecting to RabbitMQ: ${error instanceof Error ? error.message : error}`);
    setTimeout(startTaskProcessor, 5000); // Retry connection
  }
}

startTaskProcessor();
