import { Router } from 'express';
import multer from 'multer';
import UploadController from '../controllers/UploadController';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Endpoint para subir archivos con mapeo
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        await UploadController.uploadFile(req, res);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Endpoint para consultar el estado de una tarea de procesamiento
router.get('/tasks/:taskId', async (req, res) => {
    try {
        await UploadController.getTaskStatus(req, res);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
});

// Endpoint para obtener errores paginados de una tarea
router.get('/tasks/:taskId/errors', async (req, res) => {
    try {
        await UploadController.getTaskErrors(req, res);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
});

export default router;
