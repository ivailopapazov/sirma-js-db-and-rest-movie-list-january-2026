import { Router } from "express";
import { movieService } from "../services/index.js";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const movieController = Router({ mergeParams: true });

movieController.get('/', async (req, res) => {
    const movies = await movieService.getAll();

    return res.send(movies);
});

movieController.post('/', isAuthenticated, async (req, res) => {
    const movieData = req.body;
    const userId = req.user.id;

    const createdMovie = await movieService.create(movieData, userId);

    return res.status(201).send(createdMovie);
});

movieController.get('/:id', async (req, res) => {
    const movieId = req.params.id;
    const movie = await movieService.getOne(movieId);
    return res.send(movie);
});

export default movieController;
