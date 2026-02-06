import User from "../models/User.js";
import { generateToken } from "../utils/tokenUtils.js";

export async function register(userData) {
    // Logic to register a user
    const user = await User.create(userData);

    const token = generateToken(user);


    return { user, token };
}

export async function login(email, password) {
    // Logic to authenticate a user
    const user = await User.findOne({ email, password });

    if (!user) {
        throw new Error("Invalid credentials");
    }  

    const token = generateToken(user);

    return { user, token };
}
