import mongoose from 'mongoose';

const UploadTaskSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'processing', 'done'],
        required: true,
        default: 'pending'
    },
    errorList: {
        type: [{ row: Number, col: Number }],
        default: []
    },
    mapping: {
        type: Object,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    processedData: {  // ✅ Agregar este campo para guardar los datos convertidos
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const UploadTaskModel = mongoose.model('UploadTask', UploadTaskSchema);
export default UploadTaskModel;
