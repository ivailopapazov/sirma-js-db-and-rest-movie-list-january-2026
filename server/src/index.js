import express from "express";
import routes from "./routes.js";
import mongoose from "mongoose";
import cors from 'cors';
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandlerMiddleware.js";
import { loggerMiddleware } from "./middlewares/loggerMiddleware.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
try {
    // await mongoose.connect("mongodb://localhost:27017", {
    //     dbName: "rest-api-design"
    // });

    await mongoose.connect("mongodb+srv://papazovivaylo_db_user:VrnPWLdJ4XusjiSO@cluster0.liwgmdh.mongodb.net/?appName=Cluster0", {
        dbName: "rest-api-design"
    });
    
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

app.use("/api", routes);

// Global error handler
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
