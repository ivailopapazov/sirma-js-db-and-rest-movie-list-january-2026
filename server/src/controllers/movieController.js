import { Router } from "express";

import { movieService } from "../services/index.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import MovieSchema from "../schemas/movieSchema.js";
import logger from "../utils/logger.js";

const movieController = Router({ mergeParams: true });

movieController.get('/', async (req, res) => {
    const movies = await movieService.getAll(req.query);

    return res.send(movies);
});

movieController.post('/', async (req, res) => {
    const movieData = req.body;

    const userId = req.user?.id;

    try {
        const createdMovie = await movieService.create(movieData, userId);

        logger.info(`Movie created with ID: ${createdMovie.id} by user ID: ${userId}`);

        return res.status(201).send(createdMovie);
    } catch (err) {
        // Object.values(err.errors).map(e => console.log(e.message));
        logger.error(`Failed to create movie: ${err.message}`);

        return res.status(400).json({ message: err.message });
    }
});

movieController.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    const movie = await movieService.getOne(movieId);
    return res.send(movie);
});

movieController.delete('/:movieId', isAuthenticated, async (req, res) => {
    const movieId = req.params.movieId;
    const userId = req.user?.id;

    try {
        const deletedMovie = await movieService.remove(movieId, userId);
        if (!deletedMovie) {
            return res.status(404).json({ message: 'Movie not found or not authorized' });
        }
        logger.info(`Movie deleted with ID: ${movieId} by user ID: ${userId}`);
        return res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (err) {
        logger.error(`Failed to delete movie: ${err.message}`);
        return res.status(400).json({ message: err.message });
    }
});

movieController.put('/:movieId', isAuthenticated, async (req, res) => {
    const movieId = req.params.movieId;
    const userId = req.user.id;
    const movieData = req.body;

    try {
        const updatedMovie = await movieService.update(movieId, userId, movieData);
        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found or not authorized' });
        }

        logger.info(`Movie updated with ID: ${movieId} by user ID: ${userId}`);
        return res.status(200).json(updatedMovie);
    } catch (err) {
        logger.error(`Failed to update movie: ${err.message}`);
        return res.status(400).json({ message: err.message });
    }
});

export default movieController;
