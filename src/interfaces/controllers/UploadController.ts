import { Request, Response } from 'express';
import TaskService from '../../application/TaskService';
import UploadTaskRepository from '../../infrastructure/persistence/task/UploadTaskRepository';
import { logger } from '../../config/logger';
import PeopleRepository from '../../infrastructure/persistence/people/PeopleRepository';
import ErrorRepository from '../../infrastructure/persistence/errors/ErrorRepository';



class UploadController {
    
/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Sube un archivo Excel
 *     description: Permite subir un archivo Excel para validación y procesamiento.
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: ID de la tarea creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *       400:
 *         description: No se subió ningún archivo
 *       500:
 *         description: Error interno del servidor
 */



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

   /**
 * @swagger
 * /api/tasks/{taskId}:
 *   get:
 *     summary: Obtiene el estado de una tarea
 *     description: Devuelve el estado actual de la tarea de procesamiento de Excel.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Estado de la tarea
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 errorsCount:
 *                   type: integer
 *                 mapping:
 *                   type: object
 *                 processedDataCount:
 *                   type: integer
 *       404:
 *         description: Tarea no encontrada
 *       500:
 *         description: Error interno del servidor
 */


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

    /**
 * @swagger
 * /api/tasks/{taskId}/errorList:
 *   get:
 *     summary: Obtiene los errores de una tarea (paginados)
 *     description: Devuelve una lista paginada de errores encontrados en el procesamiento del archivo Excel.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tarea
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de resultados por página (por defecto 10)
 *     responses:
 *       200:
 *         description: Lista de errores paginados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       col:
 *                         type: integer
 *       404:
 *         description: No se encontraron errores para esta tarea
 *       500:
 *         description: Error interno del servidor
 */

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

/**
     * @swagger
     * /api/tasks/{taskId}/people:
     *   get:
     *     summary: Obtiene las personas asociadas a una tarea (paginadas)
     *     description: Devuelve una lista paginada de personas extraídas del archivo Excel procesado.
     *     tags:
     *       - Tasks
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la tarea
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Número de página (por defecto 1)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Número de resultados por página (por defecto 10)
     *     responses:
     *       200:
     *         description: Lista de personas encontradas en la tarea (paginadas)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 people:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       name:
     *                         type: string
     *                       age:
     *                         type: integer
     *                       otherData:
     *                         type: object
     *       404:
     *         description: No se encontraron personas para esta tarea
     *       500:
     *         description: Error interno del servidor
     */

    async getPeopleByTaskId(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const people = await PeopleRepository.getByTaskId(taskId);
            if (!people || people.length === 0) {
                res.status(404).json({ message: "No people found for this task" });
                return;
            }

            // Paginación
            const startIndex = (+page - 1) * +limit;
            const paginatedPeople = people.slice(startIndex, startIndex + +limit);

            res.status(200).json({ 
                people: paginatedPeople,
                total: people.length,
                page: +page,
                limit: +limit
            });
        } catch (error) {
            logger.error(`❌ Error en getPeopleByTaskId: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: "Unknown error" });
        }
    }

     /**
     * @swagger
     * /api/tasks/{taskId}/errors/all:
     *   get:
     *     summary: Obtiene los errores de una tarea (paginados)
     *     description: Devuelve una lista paginada de errores encontrados en el procesamiento del archivo Excel.
     *     tags:
     *       - Tasks
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *         description: ID de la tarea
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Número de página (por defecto 1)
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Número de resultados por página (por defecto 10)
     *     responses:
     *       200:
     *         description: Lista de errores encontrados en la tarea (paginados)
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       row:
     *                         type: integer
     *                         description: Número de fila donde ocurrió el error
     *                       col:
     *                         type: integer
     *                         description: Número de columna donde ocurrió el error
     *                       message:
     *                         type: string
     *                         description: Descripción del error
     *       404:
     *         description: No se encontraron errores para esta tarea
     *       500:
     *         description: Error interno del servidor
     */
    async getErrorsByTaskId(req: Request, res: Response): Promise<void> {
        try {
            const { taskId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const errors = await ErrorRepository.getByTaskId(taskId);
            if (!errors || errors.length === 0) {
                res.status(404).json({ message: "No errors found for this task" });
                return;
            }

            // Paginación
            const startIndex = (+page - 1) * +limit;
            const paginatedErrors = errors.slice(startIndex, startIndex + +limit);

            res.status(200).json({ 
                errors: paginatedErrors,
                total: errors.length,
                page: +page,
                limit: +limit
            });
        } catch (error) {
            logger.error(`❌ Error en getErrorsByTaskId: ${error instanceof Error ? error.message : error}`);
            res.status(500).json({ message: "Unknown error" });
        }
    }
}



export default new UploadController();