import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../config.js";

export function generateToken(user) {
    return jwt.sign({ id: user._id, email: user.email, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
}
