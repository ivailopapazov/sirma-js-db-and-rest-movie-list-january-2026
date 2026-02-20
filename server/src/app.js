import express from "express";
import routes from "./routes.js";
import mongoose from "mongoose";
import cors from 'cors';
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";

const app = express();

// Connect to MongoDB
try {
    await mongoose.connect(process.env.NODE_ENV.trim() === "development" ? process.env.DB_CONNECTION_DEV : process.env.DB_CONNECTION_PROD);
} catch (error) {
    console.error("Error connecting to the database", error);
}

// Setup CORS
app.use(cors());

app.use(express.json());
app.use(authMiddleware);
app.use(loggerMiddleware);

app.get("/", (req, res) => {
    res.send("Health Check!");
});

app.use('/api', routes);

// Global error handler
app.use(errorHandlerMiddleware);

export default app;
