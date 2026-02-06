import Comment from "../models/Comment.js";

export function getAll(movieId) {
    return Comment.find({ movieId });
}

export function create(commentData, movieId, userId) {
    return Comment.create({ ...commentData, movieId, userId });
}
