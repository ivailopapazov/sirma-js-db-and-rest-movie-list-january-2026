import { Schema, model } from "mongoose";

const movieSchema = new Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    poster: { type: String, required: true },
    summary: { type: String},
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
}, { timestamps: true });

export default model('Movie', movieSchema);

