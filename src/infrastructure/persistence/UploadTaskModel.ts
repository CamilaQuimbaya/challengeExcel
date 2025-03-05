import mongoose from "mongoose";

const uploadTaskSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "processing", "done"],
    default: "pending",
  },
  errors: [{ row: Number, col: Number, message: String }],
  createdAt: { type: Date, default: Date.now },
});

export const UploadTaskModel = mongoose.model("UploadTask", uploadTaskSchema);
