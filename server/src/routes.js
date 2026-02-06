import express from "express";
import userController from "./controllers/userController.js";
import movieController from "./controllers/movieController.js";
import commentController from "./controllers/commentController.js";

const routes = express.Router();

routes.use('/auth', userController);
routes.use('/movies', movieController);
routes.use('/movies/:movieId/comments', commentController);

export default routes;
