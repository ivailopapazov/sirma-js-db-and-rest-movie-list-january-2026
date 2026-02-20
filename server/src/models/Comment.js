import { Schema, model } from "mongoose";

const commentSchema = new Schema({
    content: { type: String, required: true },
    movie: {
        type: Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });

export default model('Comment', commentSchema);
