import Movie from "../models/Movie.js";

export function getAll() {
    return Movie.find({});
};

export function create(movieData, userId) {
    return Movie.create({ ...movieData, ownerId: userId });
}

export function getOne(movieId) {
    return Movie.findById(movieId);
};

export function remove(movieId, userId) {
    return Movie.findOneAndDelete({ _id: movieId, ownerId: userId });
};

export function update(movieId, userId, movieData) {
    return Movie.findOneAndUpdate({ _id: movieId, ownerId: userId }, movieData, { new: true });
};
