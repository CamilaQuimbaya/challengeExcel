import mongoose from 'mongoose';

const PeopleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    nums: {
        type: [Number],
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadTask',
        required: true,
    },
});

const PeopleModel = mongoose.model('People', PeopleSchema);
export default PeopleModel;
