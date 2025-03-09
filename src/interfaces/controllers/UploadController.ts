import { Request, Response } from 'express';
import amqp from 'amqplib';
import ExcelProcessor from '../../application/ExcelProcessor';
import UploadTaskModel from '../../infrastructure/persistence/UploadTaskModel';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = 'upload_tasks';

async function enqueueTask(taskId: string): Promise<void> {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ taskId })), { persistent: true });
        console.log(`📨 Task enqueued: ${taskId}`);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("❌ Error enqueuing task:", error);
    }
}

class UploadController {
    async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }

            let mapping;
            try {
                mapping = JSON.parse(req.body.mapping);
            } catch (error) {
                res.status(400).json({ message: 'Invalid JSON format in mapping' });
                return;
            }

            if (!mapping || typeof mapping !== 'object') {
                res.status(400).json({ message: 'Invalid or missing mapping format' });
                return;
            }

            const filePath = req.file.path;
            const result = await ExcelProcessor.processFile(filePath, mapping);
            await enqueueTask(result.id);

            res.status(201).json({ taskId: result.id });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ message: errorMessage });
        }
    }

    async getTaskStatus(req: Request, res: Response): Promise<void> {
      try {
          const { taskId } = req.params;
          const task = await UploadTaskModel.findById(taskId).lean();
          if (!task) {
              res.status(404).json({ message: 'Task not found' });
              return;
          }
  
          res.status(200).json({
              status: task.status,
              errorsCount: task.errorList?.length || 0,
              mapping: task.mapping || {},
              processedData: task.processedData || []  // ✅ Ahora sí existirá este campo en MongoDB
          });
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          res.status(500).json({ message: errorMessage });
      }
  }
  
  async getTaskErrors(req: Request, res: Response): Promise<void> {
    try {
        const { taskId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const task = await UploadTaskModel.findById(taskId).lean();
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        // ✅ Implementar paginación de errores
        const startIndex = (+page - 1) * +limit;
        const paginatedErrors = task.errorList.slice(startIndex, startIndex + +limit);

        res.status(200).json({ errors: paginatedErrors });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: errorMessage });
    }
}

}

    
export default new UploadController();