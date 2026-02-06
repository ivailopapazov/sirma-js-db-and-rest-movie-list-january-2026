# Movie List REST Client

This React client talks to a REST API hosted at `http://localhost:5000`.

## Base URL

`http://localhost:5000/api`

## Auth

All authenticated requests send:

```
Authorization: Bearer <token>
```

The client expects a response payload shape of:

```
{
  "token": "<jwt>",
  "user": {
    "id": "user-id",
    "username": "alex",
    "email": "alex@demo.com"
  }
}
```

Endpoints:

- `POST /api/auth/register`
  - Body:
    - `username` (string)
    - `email` (string)
    - `password` (string)
  - Response: `{ token, user }`
- `POST /api/auth/login`
  - Body:
    - `email` (string)
    - `password` (string)
  - Response: `{ token, user }`
- `POST /api/auth/logout`
  - Auth required
  - Response: `204 No Content`

## Movies

Movie object expected by the client:

```
{
  "id": "movie-id",
  "title": "The Last Horizon",
  "year": 2021,
  "genre": "Sci-Fi",
  "poster": "https://...",
  "summary": "Short synopsis",
  "ownerId": "user-id",
  "createdAt": "2025-11-12T10:24:00.000Z"
}
```

Endpoints:

- `GET /api/movies`
  - Response: array of movie objects
- `POST /api/movies`
  - Auth required
  - Body: `{ title, year, genre, poster, summary }`
  - Response: created movie object
- `GET /api/movies/:id`
  - Response: movie object
- `PUT /api/movies/:id`
  - Auth required (owner only)
  - Body: `{ title, year, genre, poster, summary }`
  - Response: updated movie object
- `DELETE /api/movies/:id`
  - Auth required (owner only)
  - Response: `204 No Content`

## Comments

Comment object expected by the client:

```
{
  "id": "comment-id",
  "movieId": "movie-id",
  "authorId": "user-id",
  "authorName": "Alex Carter",
  "content": "That final scene was stunning.",
  "createdAt": "2025-12-11T15:10:00.000Z"
}
```

Endpoints:

- `GET /api/movies/:id/comments`
  - Response: array of comment objects
- `POST /api/movies/:id/comments`
  - Auth required
  - Body: `{ content }`
  - Response: created comment object

## Notes

The client will also accept Mongo-style `_id` fields and map them to `id`.

## Seed Data

Seed data is provided in `server/seed-data.json`. Import it into your database before running the client.
