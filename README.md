# myFlix API

## Overview

The **myFlix API** is the server-side component of a full-stack movie web application. Built using Node.js, Express, and MongoDB, the API allows users to access information about movies, directors, and genres; manage their user accounts; and create a list of their favorite movies.

This RESTful API was developed as part of a full MERN (MongoDB, Express, React, Node.js) stack application and serves as the backend for the client-side React app.

---

## Objective

To create a fully functioning REST API that provides secure access to a movie database. The API enables users to perform operations such as retrieving data on movies, genres, and directors; creating and updating user profiles; and managing a list of favorite movies.

---

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (JWT) for authentication
- Express-validator for data validation
- Morgan for logging
- Body-parser for parsing request bodies
- CORS
- Heroku (for deployment)
- Postman (for API testing)

---

## The 5 Ws

- **Who**: Frontend developers working on the client-side (React) and end users who are movie enthusiasts.
- **What**: A fully functioning REST API that powers the backend of the myFlix application.
- **When**: Any time a user accesses the myFlix client-side application, this server handles requests.
- **Where**: Hosted online via Heroku and accessible through the internet.
- **Why**: To enable users to retrieve and interact with movie data, as well as manage their personal accounts securely.

---

## Features

### Movie Endpoints

- Get a list of all movies
- Get data about a single movie by title
- Get data about a genre by name
- Get data about a director by name

### User Endpoints

- Register a new user
- Get a user’s profile information
- Update a user’s profile information
- Add a movie to a user’s list of favorites
- Remove a movie from a user’s list of favorites
- Delete a user’s account

---

## API Documentation (Selected Endpoints)

### Movies

- `GET /movies`  
  Returns a list of all movies in the database.

- `GET /movies/:title`  
  Returns data on a single movie by title.

- `GET /genres/:name`  
  Returns genre information by name.

- `GET /directors/:name`  
  Returns director information by name.

### Users

- `POST /users`  
  Register a new user.

- `GET /users/:username`  
  Get a user’s profile data.

- `PUT /users/:username`  
  Update user information.

- `POST /users/:username/favorites/:movieId`  
  Add a movie to a user’s list of favorites.

- `DELETE /users/:username/favorites/:movieId`  
  Remove a movie from the user’s list of favorites.

- `DELETE /users/:username`  
  Delete a user’s account.

> All protected endpoints require JWT authentication.

---

## Database

The app uses a NoSQL MongoDB database hosted with MongoDB Atlas. Mongoose is used to define schemas and interact with the database.

---

## Authentication and Authorization

- New users can register and log in.
- Upon login, a JSON Web Token is returned.
- Protected routes require a valid JWT for access.

---

## Validation and Security

- All user input is validated using `express-validator`.
- Passwords are hashed before storage using bcrypt.
- CORS is configured to restrict access.
- Environment variables are used for sensitive credentials.

---

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas or local MongoDB instance
- Postman or similar tool for API testing

### Installation

1. Clone the repository:

git clone https://github.com/amyhub-alt/movie_api.git cd myflix-api


2. Install dependencies:
npm install


3. Create a `.env` file and add the following variables:

PORT=8080 DB_URI=your_mongodb_connection_string SECRET=your_jwt_secret


4. Start the server:

npm start

Server will be running at `http://localhost:8080`

---

## Deployment

The API is deployed to Heroku and accessible via the following base URL:
https://movie-api-amy-d13640458d52.herokuapp.com/


---

## Testing

All endpoints were tested using Postman to ensure they return the correct responses and handle errors gracefully.

---

## Project Structure

/models // Mongoose schemas /routes // API endpoints /auth // Authentication logic /middleware // Custom middleware (e.g., validation, logging) /public // Static files index.js // Entry point package.json // Project dependencies and scripts

```