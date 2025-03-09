import amqp from 'amqplib';
import { logger } from '../config/logger';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'upload_tasks';

export class QueueService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(QUEUE_NAME, { durable: true });
      logger.info(`✅ Connected to RabbitMQ and queue asserted`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ Error connecting to RabbitMQ: ${error.message}`);
      } else {
        logger.error(`❌ Error connecting to RabbitMQ: ${String(error)}`);
      }
      setTimeout(() => this.connect(), 5000); // Reintentar conexión en 5s
    }
  }

  async sendMessage(taskId: string): Promise<void> {
    if (!this.channel) {
      logger.warn(`⚠️ RabbitMQ channel is not initialized. Retrying connection...`);
      await this.connect();
    }
    
    try {
      const message = JSON.stringify({ taskId });
      this.channel!.sendToQueue(QUEUE_NAME, Buffer.from(message));
      logger.info(`📩 Message sent to queue '${QUEUE_NAME}':`, { taskId });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ Error sending message to RabbitMQ: ${error.message}`);
      } else {
        logger.error(`❌ Error sending message to RabbitMQ: ${String(error)}`);
      }
    }
  }
}
