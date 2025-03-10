import { error } from 'console';
import mongoose from 'mongoose';

const ErrorSchema = new mongoose.Schema({
    row: {
        type: Number,
        required: true,
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadTask',
        required: true,
    },
    nameError: {
        type: String,
        required: false,
    },
    ageError: {
        type: String,
        required: false,
    },
    numsError: {
        type: String,
        required: false,
    },
});

const ErrorModel = mongoose.model('Error', ErrorSchema);
export default ErrorModel;
