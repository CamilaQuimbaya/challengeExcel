import { Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { uploadMiddleware } from "../middlewares/uploadMiddleware";

const router = Router();

router.post("/upload", uploadMiddleware, UploadController.uploadFile);
router.get("/tasks/:taskId", UploadController.getTaskStatus);

export default router;
