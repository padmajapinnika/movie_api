const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(express.static('public'));
app.use(morgan('common'));

app.get('/error', (req, res) => {
    throw new Error('Something went wrong!');
  });
  
  // Error-handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack); // This logs the full stack trace for debugging
    res.status(500).send('Something went wrong! Our team is working on it.');
});
  
// Top 10 Movies Data
app.get('/movies', (req, res) => {
const movies = [
  { title: 'Inception', director: 'Christopher Nolan' },
  { title: 'The Shawshank Redemption', director: 'Frank Darabont' },
  { title: 'The Dark Knight', director: 'Christopher Nolan' },
  { title: 'Pulp Fiction', director: 'Quentin Tarantino' },
  { title: 'The Lord of the Rings: The Return of the King', director: 'Peter Jackson' },
  { title: 'Forrest Gump', director: 'Robert Zemeckis' },
  { title: 'The Matrix', director: 'The Wachowskis' },
  { title: 'Fight Club', director: 'David Fincher' },
  { title: 'Interstellar', director: 'Christopher Nolan' },
  { title: 'The Godfather', director: 'Francis Ford Coppola' }
];
res.json(movies);
});
// GET route for '/'
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
});
// Listen on port 8080
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });