import { Schema, model } from "mongoose";

const movieSchema = new Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minLength: [2, "Title must be at least 2 characters long"],
        maxLength: [100, "Title must be at most 100 characters long"],
    },
    year: { type: Number, required: [true, "Year is required"] },
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

