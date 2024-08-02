// REST API
const express = require('express');
morgan = require('morgan');

const app = express();
const bodyParser = require('body-parser'),
methodOverride = require('method-override');

app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: true
  }));
  
  app.use(bodyParser.json());
  app.use(methodOverride());

app.use(express.static('public'));

let topMovies = [
    {
        title: 'Kill Bill',
        director: 'Quentin Tarantino'
      },
      {
        title: 'Scott Pilgrim vs. the World',
        director: 'Edgar Wright'
      },
      {
        title: 'Whiplash',
        director: 'Damien Chazelle'
      },
      {
        title: 'Fight Club',
        director: 'David Fincher'
      },
      {
        title: 'Arrival',
        director: 'Denis Villeneuve'
      },
      {
        title: 'Sound of Metal',
        director: 'Darius Marder'
      },
      {
        title: 'Beetlejuice',
        director: 'Tim Burton'
      },
      {
        title: 'Lucky Number Slevin',
        director: 'Paul McGuigan'
      },
      {
        title: 'Nope',
        director: 'Jordan Peele'
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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});