import { Router } from "express";
import { commentService } from "../services/index.js";

const commentController = Router({ mergeParams: true });

commentController.get('/', async (req, res) => {
    const movieId = req.params.movieId;

    const comments = await commentService.getAll(movieId);

    return res.send(comments);
});

commentController.post('/', async (req, res) => {
    const movieId = req.params.movieId;
    const commentData = req.body;
    const userId = req.user.id;

    // Implementation for creating a comment can be added here
    const result = await commentService.create(commentData, movieId, userId);

    return res.status(201).send({...result, userId, movieId});
});

export default commentController;
