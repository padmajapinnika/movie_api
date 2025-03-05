// Import necessary modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

// Sample data for users
let users = [
    {
        id: 1,
        name: "padmaja",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "amrutha",
        favoriteMovies: []
    },
    {
        id: 3,
        name: "nandhini",
        favoriteMovies: []
    },
    {
        id: 4,
        name: "naga",
        favoriteMovies: []
    }
];

// Create a new user
app.post('/users', (req, res) => {
    const newUser = req.body;
    if (newUser.name) {
        newUser.id = uuid.v4(); // Generate a unique ID
        users.push(newUser); // Add the new user to the list
        res.status(201).json(newUser); // Respond with the created user
    } else {
        res.status(400).send('User needs a name'); // Error if no name is provided
    }
});

// Update an existing user by ID
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id); // Find the user by ID

    if (user) {
        user.name = updatedUser.name; // Update the user's name
        res.status(200).json(user); // Respond with the updated user
    } else {
        res.status(404).send('No such user'); // Error if the user is not found
    }
});

// Add a movie to a user's favorite movies
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; // Extract ID and movie title from the request params
    let user = users.find(user => user.id == id); // Find the user by ID

    if (user) {
        user.favoriteMovies.push(movieTitle); // Add the movie to the user's favorites
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`); // Success message
    } else {
        res.status(400).send('No such user'); // Error if the user is not found
    }
});

// Remove a movie from a user's favorite movies
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params; // Extract ID and movie title from the request params
    let user = users.find(user => user.id == id); // Find the user by ID

    if (user) {
        // Remove the movie from the user's favoriteMovies array
        user.favoriteMovies = user.favoriteMovies.filter(title => title != movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`); // Success message
    } else {
        res.status(400).send('No such user'); // Error if the user is not found
    }
});

// Delete a user by ID
app.delete('/users/:id', (req, res) => {
    const { id } = req.params; // Extract user ID from the request params
    let user = users.find(user => user.id == id); // Find the user by ID

    if (user) {
        // Remove the user from the users array
        users = users.filter(user => user.id != id);
        res.status(200).send(`User ${id} has been deleted`); // Success message
    } else {
        res.status(400).send('No such user'); // Error if the user is not found
    }
});

// Sample movie data
let movies = [
    { 
        Title: 'Inception', 
        Description: 'A thief who enters the dreams of others to steal secrets from their subconscious.', 
        Genre: 'Sci-Fi', 
        GenreDescription: 'A genre that explores futuristic concepts, advanced technology, space exploration, and the nature of reality.',
        Director: { 
            Name: 'Christopher Nolan', 
            Bio: 'British-American filmmaker known for complex storytelling and visual spectacle.', 
            BirthYear: 1970, 
            DeathYear: null 
        }, 
        ImageURL: 'https://image-url.com/inception.jpg', 
        IsFeatured: true 
    },
    { 
        Title: 'The Shawshank Redemption', 
        Description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.', 
        Genre: 'Drama', 
        GenreDescription: 'A genre that focuses on realistic storytelling, character development, and emotional themes.',
        Director: { 
            Name: 'Frank Darabont', 
            Bio: 'French-American film director, screenwriter, and producer known for adapting Stephen King stories.', 
            BirthYear: 1959, 
            DeathYear: null 
        }, 
        ImageURL: 'https://image-url.com/shawshank.jpg', 
        IsFeatured: true 
    },
    { 
        Title: 'The Dark Knight', 
        Description: 'Batman faces his greatest challenge in the form of the Joker, a criminal mastermind.', 
        Genre: 'Action', 
        GenreDescription: 'A genre known for high-intensity sequences, physical feats, and conflict-driven storylines.',
        Director: { 
            Name: 'Christopher Nolan', 
            Bio: 'British-American filmmaker known for complex storytelling and visual spectacle.', 
            BirthYear: 1970, 
            DeathYear: null 
        }, 
        ImageURL: 'https://image-url.com/dark-knight.jpg', 
        IsFeatured: true 
    }
    // Add other movies as necessary...
];

// Get all movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies); // Return all movies
});

// Get a movie by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params; // Extract the title from the URL parameter

    const movie = movies.find(movie => movie.Title === title); // Find the movie by title

    if (movie) {
        res.status(200).json(movie); // Return the movie if found
    } else {
        res.status(400).send('No such movie'); // Error if movie not found
    }
});

// Get movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;  // Extract the genre name from the URL parameter
    console.log('Genre requested:', genreName);  // Debugging line to see the requested genre

    const genre = movies.filter(movie => movie.Genre === genreName); 

    if (genre.length) {
        res.status(200).json(genre);  // Return the movies of the requested genre
    } else {
        res.status(404).send('No such genre');  // Return error message if genre not found
    }
});


// Get movies by director
app.get('/movies/director/:directorName', (req, res) => {
    const { directorName } = req.params; // Extract the director's name from the URL parameter
    const directorMovies = movies.filter(movie => movie.Director.Name === directorName); // Filter movies by director

    if (directorMovies.length > 0) {
        res.status(200).json(directorMovies); // Return the movies directed by the specified director
    } else {
        res.status(400).send('No such director'); // Error if no movies found for the director
    }
});

// Start the server and listen on port 8080
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
