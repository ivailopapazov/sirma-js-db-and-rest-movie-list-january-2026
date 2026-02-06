import express from "express";
import routes from "./routes.js";
import mongoose from "mongoose";
import cors from 'cors';
import { authMiddleware } from "../middlewares/authMiddleware.js";

const app = express();

// Connect to MongoDB
try {
    await mongoose.connect("mongodb://localhost:27017", {
        dbName: "rest-api-design"
    });
} catch (error) {
    console.error("Error connecting to the database", error);
}

// Setup CORS
app.use(cors());

app.use(express.json());
app.use(authMiddleware);

app.get("/", (req, res) => {
    res.send("Health Check!");
});

app.use("/api", routes);

app.listen(5000, () => {
    console.log("Server is running on port http://localhost:5000");
});
