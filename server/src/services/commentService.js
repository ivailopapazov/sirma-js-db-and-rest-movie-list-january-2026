import Comment from "../models/Comment.js";

export function getAll(movieId) {
    return Comment.find({ movie: movieId }).populate('author');
}

export function create(commentData, movieId, userId) {
    return Comment.create({ ...commentData, movie: movieId, author: userId });
}
