import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../../config.js';

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export function isAuthenticated(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    next();
}
