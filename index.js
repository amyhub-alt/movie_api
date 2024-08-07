// REST API
const express = require('express');
const app = express();
morgan = require('morgan');
uuid = require('uuid');
const bodyParser = require('body-parser'),
methodOverride = require('method-override');


// middlewares
app.use(morgan('common'));

app.use(bodyParser.urlencoded({  // encodes url automatically
    extended: true
  }));

app.use(bodyParser.json());   //handles json conversions automatically 
app.use(methodOverride());

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


let topMovies = [
    {
      id: 1,
      title: 'Kill Bill',
      director: {
        name: 'Quentin Tarantino',
        bio: 'Quentin Tarantino is an American filmmaker known for his stylized violence, sharp dialogue, and nonlinear storytelling. He has directed numerous critically acclaimed films and is considered one of the most influential directors of his generation.',
        birth_year: 1963,
        death_year: 'Present'
      },
      genre: 'Action, Thriller',
      description: '"Kill Bill" follows The Bride, a former assassin seeking revenge on her ex-team and boss, Bill, after being betrayed and left for dead. Directed by Quentin Tarantino, this action-packed thriller features stylized violence and a gripping tale of vengeance.',
      imageURL: 'images/killbill_image.jpg'
    },
    {
      id: 2,
      title: 'Scott Pilgrim vs. the World',
      director: {
        name: 'Edgar Wright',
        bio: 'Edgar Wright is a British filmmaker known for his unique visual style and comedic timing. He has directed a number of popular films, often collaborating with actor Simon Pegg.',
        birth_year: 1974,
        death_year: 'Present'
      },
      genre: 'Action, Comedy',
      description: '"Scott Pilgrim vs. the World" follows Scott Pilgrim, a young musician who must defeat his new girlfriend\'s seven evil exes in battle. Directed by Edgar Wright, this film blends action and comedy with a unique visual style.',
      image_url: 'images/scottpilgrimvstheworld_image.jpg'
    },
    {
      id: 3,
      title: 'Whiplash',
      director: {
        name: 'Damien Chazelle',
        bio: 'Damien Chazelle is an American filmmaker and screenwriter known for his work on musical dramas and intense character studies. He gained acclaim for his films "Whiplash" and "La La Land."',
        birth_year: 1985,
        death_year: 'Present'
      },
      genre: 'Drama, Music',
      description: '"Whiplash" tells the intense story of a young drummer under the mentorship of a ruthless music instructor. Directed by Damien Chazelle, it explores themes of ambition and obsession in the world of music.',
      image_url: 'images/whiplash_image.jpg'
    },
    {
      id: 4,
      title: 'Fight Club',
      director: {
        name: 'David Fincher',
        bio: 'David Fincher is an American filmmaker known for his dark, meticulous style and psychological thrillers. His notable works include "Fight Club," "Se7en," and "Gone Girl."',
        birth_year: 1962,
        death_year: 'Present'
      },
      genre: 'Drama, Thriller',
      description: '"Fight Club" centers on an insomniac office worker who forms an underground fight club with a soap salesman. Directed by David Fincher, this film delves into themes of identity, consumerism, and rebellion.',
      image_url: 'images/fightclub_image.jpg'
    },
    {
      id: 5,
      title: 'Arrival',
      director: {
        name: 'Denis Villeneuve',
        bio: 'Denis Villeneuve is a Canadian filmmaker known for his visually stunning and thought-provoking films. He has directed "Arrival," "Blade Runner 2049," and "Dune."',
        birth_year: 1967,
        death_year: 'Present'
      },
      genre: 'Drama, Sci-Fi',
      description: '"Arrival" follows a linguist tasked with communicating with aliens who have landed on Earth. Directed by Denis Villeneuve, this thought-provoking sci-fi drama explores language, time, and human connection.',
      image_url: 'images/arrival_image.jpg'
    },
    {
      id: 6,
      title: 'Sound of Metal',
      director: {
        name: 'Darius Marder',
        bio: 'Darius Marder is an American filmmaker and screenwriter known for his film "Sound of Metal," which explores themes of hearing loss and personal transformation.',
        birth_year: 1975,
        death_year: 'Present'
      },
      genre: 'Drama, Music',
      description: '"Sound of Metal" follows a drummer who begins to lose his hearing and must come to terms with his new reality. Directed by Darius Marder, this film is a powerful exploration of identity and resilience.',
      image_url: 'images/soundofmetal_image.jpg'
    },
    {
      id: 7,
      title: 'Beetlejuice',
      director: {
        name: 'Tim Burton',
        bio: 'Tim Burton is an American filmmaker known for his distinctive, gothic visual style and quirky storytelling. His notable works include "Beetlejuice," "Edward Scissorhands," and "The Nightmare Before Christmas."',
        birth_year: 1958,
        death_year: 'Present'
      },
      genre: 'Comedy, Fantasy',
      description: '"Beetlejuice" is a dark comedy about a recently deceased couple who hire a bio-exorcist to remove the new living occupants of their home. Directed by Tim Burton, it features quirky humor and imaginative visuals.',
      image_url: 'images/beetlejuice_image.jpg'
    },
    {
      id: 8,
      title: 'Lucky Number Slevin',
      director: {
        name: 'Paul McGuigan',
        bio: 'Paul McGuigan is a Scottish filmmaker known for his work in film and television. His films often combine dark humor with thrilling plots.',
        birth_year: 1969,
        death_year: 'Present'
      },
      genre: 'Crime, Thriller',
      description: '"Lucky Number Slevin" involves a case of mistaken identity that leads an innocent man into the middle of a war between two crime bosses. Directed by Paul McGuigan, this film is filled with twists and dark humor.',
      image_url: 'images/luckynumbersleven_image.jpg'
    },
    {
      id: 9,
      "title": 'Nope',
      director: {
        name: 'Jordan Peele',
        bio: 'Jordan Peele is an American filmmaker and comedian known for his work in the horror genre. His films, such as "Get Out" and "Us," combine social commentary with suspenseful storytelling.',
        birth_year: 1979,
        death_year: 'Present'
      },
      genre: 'Horror, Mystery',
      description: '"Nope" is a horror mystery film directed by Jordan Peele. The story unfolds with unsettling events that reveal deeper societal themes, characteristic of Peele\'s thought-provoking and suspenseful style.',
      image_url: 'images/nope_image.jpg'
    },
    {
      id: 10,
      title: "She's the Man",
      director: {
        name: 'Andy Fickman',
        bio: 'Andy Fickman is an American director and producer known for his work in comedy and family films. His notable works include "She\'s the Man" and "Race to Witch Mountain."',
        birth_year: 1970,
        death_year: 'Present'
      },
      genre: 'Comedy, Romance',
      description: '"She\'s the Man" is a modern adaptation of Shakespeare\'s "Twelfth Night," where a teenage girl disguises herself as her twin brother to join his soccer team. Directed by Andy Fickman, this film combines humor, romance, and sports in a delightful blend.',
      image_url: 'images/shestheman_image.jpg'
    }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

// a web page being sent back
app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

//books data being sent back
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//returns data about a single movie
app.get('/movies/:title', (req, res) => {
  const movie = topMovies.find((movie) => movie.title === req.params.title);
  if (movie) {
    res.json(movie);
  } else {
    res.status(404).send('Movie not found');
  }
});

// Return titles of movies by genre name
app.get('/movies/genre/:genre', (req, res) => {
  const genre = req.params.genre;
  const moviesByGenre = topMovies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  if (moviesByGenre.length > 0) {
    const movieGenres = moviesByGenre.map(movie => movie.title);
    res.json(movieGenres);
  } else {
    res.status(404).send('No movies found for this genre');
  }
});

//Return data about a director (bio, birth year, death year) by name;
app.get('/movies/director/:name', (req,res) => {
  const directorName = req.params.name;
  const movie = topMovies.find(movie => movie.director.name.toLowerCase() === directorName.toLowerCase());
  if (movie) {
    res.json({
      name: movie.director.name,
      bio: movie.director.bio,
      birth_year: movie.director.birth_year,
      death_year: movie.director.death_year
    });
  } else {
    res.status(404).send('Director not found');
  }
});








// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});