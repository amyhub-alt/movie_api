// REST API
const express = require('express');
const app = express();
morgan = require('morgan');
uuid = require('uuid');
const bodyParser = require('body-parser')
const { check, validationResult } = require('express-validator');


//these lines require mongoose package and models.js file as well as the models to refer to the model names i defines in the models.js
const mongoose = require('mongoose');
const Models = require('./models');
const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/cfDB');
// mongoose.connect('mongodb+srv://altiefermann:T6SbXuLrbATpeeQY@cluster0.nhctskx.mongodb.net/cfDB')
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// // middlewares
app.use(morgan('common'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
app.use(bodyParser.urlencoded({  // encodes url automatically
    extended: true
  }));

const cors = require('cors');
app.use(cors());


let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric()


// // GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

// a web page being sent back
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});


// Get all users
app.get('/users',  (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});





/**
 * @function addUser
 * @name POST /users
 * @description Registers a new user with a username, hashed password, email, and optional birthday.
 * @param {Object} req.body - Contains user info
 * @param {string} req.body.Username - Username (min 5 characters, alphanumeric)
 * @param {string} req.body.Password - User's password (required)
 * @param {string} req.body.Email - User's email (must be valid format)
 * @param {string} [req.body.Birthday] - User's birthday (optional)
 * @returns {Object} 201 - Created user object
 * @returns {string} 400 - Username already exists
 * @returns {Object} 422 - Validation errors
 * @returns {Error} 500 - Server error
 */
app.post('/users',

  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {
  // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });



/**
 * @function getUser
 * @name GET /users/:Username
 * @description Retrieves a user by their username.
 * @param {string} Username - The username of the user to retrieve
 * @returns {Object} 200 - A user object
 * @returns {Error} 500 - Server error
 */
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


/**
 * @function updateUser
 * @name PUT /users/:Username
 * @description Updates a user's email and birthday. Requires JWT authentication and valid email.
 * @param {Object} req.body - Contains user's updated Email and Birthday
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 422 - Validation error
 * @returns {Error} 500 - Server error
 */
app.put('/users/:Username', 
  [
    check('Email', 'Email does not appear to be valid').isEmail()
  ], 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Hash the password if it's being updated
    let hashedPassword = req.body.Password ? Users.hashPassword(req.body.Password) : undefined;

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send('Error: ' + err);
      });
  }
);



/**
 * @function addFavoriteMovie
 * @name POST /users/:Username/movies/:MovieID
 * @description Adds a movie to the user's list of favorite movies.
 * @param {string} Username - The username of the user
 * @param {string} MovieID - The ID of the movie to add
 * @returns {Object} 200 - Updated user object with new favorite movie
 * @returns {Error} 500 - Server error
 */
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



/**
 * @function removeFavoriteMovie
 * @name DELETE /users/:Username/movies/:MovieID
 * @description Removes a movie from the user's list of favorite movies.
 * @param {string} Username - The username of the user
 * @param {string} MovieID - The ID of the movie to remove
 * @returns {Object} 200 - Updated user object without the removed movie
 * @returns {Error} 500 - Server error
 */
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
 Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});



/**
 * @function deleteUser
 * @name DELETE /users/:Username
 * @description Deletes a user by username.
 * @param {string} Username - The username of the user to delete
 * @returns {string} 200 - Success message confirming deletion
 * @returns {string} 400 - User not found
 * @returns {Error} 500 - Server error
 */
app.delete('/users/:Username', (req, res) => {
   Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



/** 
 * @function getAllMovies
 * @name GET /movies
 * @description Returns a list of all movies. Requires JWT authentication
 * @returns {Array<Object>} 201- an array of movie objects
 * @returns {Error} 500- server error
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});




/**
 * @function getMovieByTitle
 * @name GET /movies/:title
 * @description Returns a single movie by its title.
 * @param {string} title - The title of the movie to retrieve
 * @returns {Object} 200 - A movie object
 * @returns {Error} 500 - Server error
 */
app.get('/movies/:title',  (req, res) => {
  Movies.findOne({ Title: req.params.title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});




/**
 * @function getGenreInfo
 * @name GET /genre/:Name
 * @description Returns information about a specific genre by name.
 * @param {string} Name - The name of the genre to retrieve
 * @returns {Object} 200 - An object containing genre name and description
 * @returns {string} 404 - Genre not found
 * @returns {Error} 500 - Server error
 */
app.get('/genre/:Name', (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      if (movie) {
        res.json({
          Genre: movie.Genre.Name,
          Description: movie.Genre.Description
        });
      } else {
        res.status(404).send('Genre not found');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});





/**
 * @function getDirectorInfo
 * @name GET /movies/director/:name
 * @description Returns data about a director (bio, birth year, death year) by name.
 * @param {string} name - The name of the director
 * @returns {Object} 200 - An object containing director's name, bio, birth, and death year
 * @returns {string} 404 - Director not found
 * @returns {Error} 500 - Server error
 */
app.get('/movies/director/:name', (req,res) => {
 Movies.findOne({ 'Director.Name': req.params.name })
 .then ((movie) => {
  if (movie) {
    res.json({
      name: movie.Director.Name,
      bio: movie.Director.Bio,
      birth: movie.Director.Birth,
      death: movie.Director.Death
    });
  } else {
    res.status(404).send('Director not found');
  }
})
 .catch ((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
 });
});


// listen for requests

// app.listen(8080, () => {
//   console.log('Your app is listening on port 8080.');
// });

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

// methodOverride = require('method-override');


