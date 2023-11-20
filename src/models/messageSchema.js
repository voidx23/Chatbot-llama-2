import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['sent', 'received']
    },
    messageId: {
        type: String,

    },
});

const Message = mongoose.model('Message', messageSchema);

export default Message;