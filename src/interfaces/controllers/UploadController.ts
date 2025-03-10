import { Request, Response } from 'express';
import TaskService from '../../application/TaskService';
import UploadTaskRepository from '../../infrastructure/persistence/task/UploadTaskRepository';
import { logger } from '../../config/logger';
import PeopleRepository from '../../infrastructure/persistence/people/PeopleRepository';
import ErrorRepository from '../../infrastructure/persistence/errors/ErrorRepository';

class UploadController {
    

    async uploadFile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }

           
            const filePath = req.file.path;
            
            logger.info('✅ UploadController: Llamando a TaskService.startTask()...');
            const result = await TaskService.startTask(filePath);
            logger.info(`✅ Task creada con ID: ${result.id}`);

            res.status(201).json({ taskId: result.id });
        } catch (error) {
            logger.error(`❌ Error en UploadController: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getTaskStatus(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const task = await UploadTaskRepository.getById(taskId);
            if (!task) {
                res.status(404).json({ message: 'Task not found' });
                return;
            }

            res.status(200).json({
                status: task.status,
                errorsCount: task.errors?.length || 0,
                mapping: task.mapping || {},
                processedDataCount: task.processedData?.length || 0
            });
        } catch (error) {
            logger.error(`❌ Error en getTaskStatus: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getTaskErrors(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const task = await UploadTaskRepository.getById(taskId);
            if (!task) {
                res.status(404).json({ message: 'Task not found' });
                return;
            }

            const startIndex = (+page - 1) * +limit;
            const paginatedErrors = task.errors?.slice(startIndex, startIndex + +limit) || [];

            res.status(200).json({ errors: paginatedErrors });
        } catch (error) {
            logger.error(`❌ Error en getTaskErrors: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getPeopleByTaskId(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const people = await PeopleRepository.getByTaskId(taskId);
            
            if (!people || people.length === 0) {
                res.status(404).json({ message: 'No people found for this task' });
                return;
            }

            res.status(200).json({ people });
        } catch (error) {
            logger.error(`❌ Error en getPeopleByTaskId: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }

    async getErrorsByTaskId(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const errors = await ErrorRepository.getByTaskId(taskId);
            
            if (!errors || errors.length === 0) {
                res.status(404).json({ message: 'No errors found for this task' });
                return;
            }

            res.status(200).json({ errors });
        } catch (error) {
            logger.error(`❌ Error en getErrorsByTaskId: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
}



export default new UploadController();