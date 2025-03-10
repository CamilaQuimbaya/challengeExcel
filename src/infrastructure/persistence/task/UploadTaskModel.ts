import mongoose from 'mongoose';

const UploadTaskSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'processing', 'done'],
        required: true,
        default: 'pending'
    },
    filePath: {
        type: String,
        required: true
    },
    errorCount: {
        type: Number,
        default: 0
    },
    newPeopleCount: {
        type: Number,
        default: 0
    },
});

const UploadTaskModel = mongoose.model('UploadTask', UploadTaskSchema);
export default UploadTaskModel;
