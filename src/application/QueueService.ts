import amqp from 'amqplib';
import { logger } from '../config/logger';

class QueueService {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;
    private readonly queueName: string = 'upload_tasks';

    async connect(): Promise<void> {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
            logger.info('Connected to RabbitMQ and queue asserted');
        } catch (error) {
            logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
    }

    async sendMessage(message: object): Promise<void> {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }
        this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(message)), { persistent: true });
        logger.info('Message sent to queue', message);
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
        logger.info('RabbitMQ connection closed');
    }
}

export const queueService = new QueueService();
