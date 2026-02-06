import * as z from "zod";

const MovieSchema = z.object({
    title: z.string().min(1, "Title is required"),
    releaseYear: z.number().int().min(1888, "Release year must be after 1888"),
    genre: z.string().min(1, "Genre is required"),
    poster: z.url("Poster must be a valid URL").min(1, "Poster is required"),
    summary: z.string().optional(),
    ownerId: z.string().min(1, "Owner ID is required"),
});

export default MovieSchema;
