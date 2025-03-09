import RabbitMQService from '../infrastructure/messaging/RabbitMQService';
import { logger } from '../config/logger';
import { env } from "../config/env";

class QueueService {
  async sendMessage(taskId: string): Promise<void> {
    try {
      const message = JSON.stringify({ taskId });
      await RabbitMQService.publishMessage(message);
      logger.info(`📩 Message sent to queue '${env.QUEUE_NAME}':`, { taskId });
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`❌ Error sending message to RabbitMQ: ${error.message}`);
      } else {
        logger.error(`❌ Error sending message to RabbitMQ: ${String(error)}`);
      }
    }
  }
}

export default new QueueService();