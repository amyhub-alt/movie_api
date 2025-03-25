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

// const cors = require('cors');
// app.use(cors());

const cors = require('cors');
let allowedOrigins = [
  'http://localhost:8080', 
  'http://testsite.com', 
  'http://localhost:1234', 
  'https://dynamic-phoenix-7d9a80.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

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


//ADD A USER
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
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
// app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
//   // CONDITION TO CHECK ADDED HERE
//   if(req.user.Username !== req.params.Username){
//       return res.status(400).send('Permission denied');
//   }
//   // CONDITION ENDS
//   await Users.findOneAndUpdate({ Username: req.params.Username }, {
//       $set:
//       {
//           Username: req.body.Username,
//           Password: req.body.Password,
//           Email: req.body.Email,
//           Birthday: req.body.Birthday
//       }
//   },
//       { new: true }) // This line makes sure that the updated document is returned
//       .then((updatedUser) => {
//           res.json(updatedUser);
//       })
//       .catch((err) => {
//           console.log(err);
//           res.status(500).send('Error: ' + err);
//       })
// });
// UPDATE USER DATA
app.put('/users/:Username', 
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], 
  passport.authenticate('jwt', { session: false }), 
  async (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // CONDITION TO CHECK ADDED HERE
    // if (req.user.Username !== req.params.Username) {
    //   return res.status(400).send('Permission denied');
    // }
    // CONDITION ENDS

    // Hash the password if it's being updated
    let hashedPassword = req.body.Password ? Users.hashPassword(req.body.Password) : undefined;

    await Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword || req.user.Password, // Use the hashed password if provided, else keep the current one
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

// Remove a movie on a user's list of favorites- 
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
// app.get('/movies', (req, res) => {
//   Movies.find()
//    .then((movies) => {
//      res.status(201).json(movies);
//    })
//    .catch((err) => {
//      console.error(err);
//      res.status(500).send('Error: ' + err);
//    });
// });


//get all movies but they have to be authenicated
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




// Get a movie by title-WORKS
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




// Get information about a genre by name-  
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

//this is a test




//Return data about a director (bio, birth year, death year) by name;//
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


