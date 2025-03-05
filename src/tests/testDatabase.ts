import { connectDatabase } from "../infrastructure/config/database";
import { UploadTaskRepository } from "../infrastructure/persistence/UploadTaskRepository";

const test = async () => {
  await connectDatabase();

  const repository = new UploadTaskRepository();
  const taskId = await repository.createTask();
  console.log(`✅ Task creada con ID: ${taskId}`);

  const task = await repository.getTask(taskId);
  console.log("📌 Tarea obtenida:", task);
};

test();
