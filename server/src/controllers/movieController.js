import { Router } from "express";

import { movieService } from "../services/index.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import MovieSchema from "../schemas/movieSchema.js";
import logger from "../utils/logger.js";

const movieController = Router({ mergeParams: true });

movieController.get('/', async (req, res) => {
    const movies = await movieService.getAll();

    return res.send(movies);
});

movieController.post('/', async (req, res) => {
    const movieData = req.body;

    // validate using zod schema
    // try {
    //     MovieSchema.parse(movieData);
    // } catch (err) {
    //     return res.status(400).json({ message: err.issues.at(0).message });
    // }

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

export default movieController;
