// REST API
const express = require('express');
const app = express();
morgan = require('morgan');
uuid = require('uuid');
const bodyParser = require('body-parser')

//these lines require mongoose package and models.js file as well as the models to refer to the model names i defines in the models.js
const mongoose = require('mongoose');
const Models = require ('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB');

// // middlewares
app.use(morgan('common'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({  // encodes url automatically
    extended: true
  }));


app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



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


//Add a user
/* We’ll expect JSON in this format
{ID: Integer, Username: String, Password: String, Email: String, Birthday: Date}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users.create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{
            res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get a user by username
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

// Update a user's info, by username
/* We’ll expect JSON in this format
{Username: String,(required) Password: String,(required)Email: String,(required)Birthday: Date}*/
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, 
    { 
      $set:{
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })

});

// Add a movie to a user's list of favorites
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

// Delete a user by username
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

///////

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
   .then((movies) => {
     res.status(201).json(movies);
   })
   .catch((err) => {
     console.error(err);
     res.status(500).send('Error: ' + err);
   });
});



// Get a movie by title
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

// // // Return titles of movies by genre name
// app.get('/movies/genre/:genre', (req, res) => {
//   const genre = req.params.genre;
//   const moviesByGenre = topMovies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
//   if (moviesByGenre.length > 0) {
//     const movieGenres = moviesByGenre.map(movie => movie.title);
//     res.json(movieGenres);
//   } else {
//     res.status(404).send('No movies found for this genre');
//   }
// });



// Get information about a genre by name-  NOT WORKING
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






//Return data about a director (bio, birth year, death year) by name;//NOT WORKING
app.get('/movies/director/:name', (req,res) => {
 Movies.findOne({ 'director.name': req.params.name })
 .then ((movie) => {
  if (movie) {
    res.json({
      name: movie.director.name,
      bio: movie.director.bio,
      birth_year: movie.director.birth,
      death_year: movie.director.death
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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

// methodOverride = require('method-override');


