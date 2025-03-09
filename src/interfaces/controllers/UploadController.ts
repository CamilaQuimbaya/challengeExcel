import { Request, Response } from 'express';
import ExcelProcessor from '../../application/ExcelProcessor';
import UploadTaskModel from '../../infrastructure/persistence/UploadTaskModel';

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
                processedData: task.processedData || []
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