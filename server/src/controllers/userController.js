import { Router } from "express";
import { userService } from "../services/index.js";

const userController = Router();

userController.post('/register', async (req, res) => {
    const userData = req.body;

    try {
        const response = await userService.register(userData);

        return res.send(response);
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).send({ success: false, message: "Internal Server Error" });
    }
});

userController.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await userService.login(email, password);

        return res.send(response);
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).send({ success: false, message: "Internal Server Error" });
    }
});

userController.post('/logout', (req, res) => {
    // TODO Check auth
    
    return res.status(204).send();
});

export default userController;
