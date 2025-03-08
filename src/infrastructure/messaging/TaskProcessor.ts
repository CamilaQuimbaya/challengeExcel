import { queueService } from '../messaging/QueueService';
import { excelProcessor } from '../../application/ExcelProcessor';
import { UploadTaskRepository } from '../../infrastructure/persistence/UploadTaskRepository';
import { logger } from '../../config/logger';

class TaskProcessor {
    private readonly queueName: string = 'upload_tasks';
    private repository = new UploadTaskRepository();

    async start(): Promise<void> {
        await queueService.connect();
        const channel = queueService['channel'];

        if (!channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        channel.consume(this.queueName, async (msg: { content: { toString: () => string; }; }) => {
            if (msg) {
                const task = JSON.parse(msg.content.toString());
                logger.info(`Processing task: ${task.id}`);

                try {
                    const { data, errors } = excelProcessor.processFile(Buffer.from(task.fileBuffer, 'base64'));
                    await this.repository.updateTask(task.id, { status: 'done', errors: errors.length, processedData: data });
                } catch (error) {
                    logger.error('Error processing task', error);
                    await this.repository.updateTask(task.id, { status: 'failed' });
                }

                channel.ack(msg);
            }
        });
    }
}

export const taskProcessor = new TaskProcessor();
