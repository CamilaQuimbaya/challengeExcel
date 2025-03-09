import mongoose from "mongoose";

const UploadTaskSchema = new mongoose.Schema({
  status: { type: String, required: true, enum: ["pending", "processing", "done", "error"], default: "pending" },
  errorList: { type: Array, default: [] } // ✅ Nuevo nombre
});

export const UploadTaskModel = mongoose.model("UploadTask", UploadTaskSchema);
