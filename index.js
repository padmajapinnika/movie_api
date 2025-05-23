// Import necessary modules
const express = require('express');
const morgan = require("morgan");
const mongoose = require('mongoose');
const uuid = require('uuid');
const Models = require('./models.js');
const passport = require('passport');
const cors = require('cors');

const { check, validationResult } = require('express-validator');
require('dotenv').config();

// Debugging log to confirm the MongoDB URI
console.log("MongoDB URI:", process.env.CONNECTION_URI); 

// Destructure Models
const Movies = Models.Movie;
const Users = Models.User;
const app = express();
let allowedOrigins = [
    'http://localhost:1234',
    'http://localhost:8080',
    'http://localhost:4200',
    'https://movie-api-padma-7528be21ca05.herokuapp.com',
    'https://padmajapinnika-1215.netlify.app',
    'https://padmajapinnika.github.io'
  ];
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Initialize authentication and passport
let auth = require('./auth')(app);
require('./passport');

// Connect to MongoDB
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Default text response when at '/'
app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!")
});

// Return all movies in JSON format
app.get('/movies',passport.authenticate('jwt', { session: false }), async (req, res) => {
   await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});



// Return a movie by title
app.get("/movies/:title", passport.authenticate('jwt', { session: false }),[
    check('title', 'Title should be alphanumeric').isAlphanumeric()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            if (!movie) {
                return res.status(404).send("Movie not found");
            }
            res.status(200).json(movie);  // Return the movie data
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

  //get all users
  app.get("/users", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
    .then(function(users) {
        res.status(201).json(users);
    })
    .catch(function(err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});


// Get a user by username
app.get("/users/:Username", passport.authenticate('jwt', { session: false }),[
    check('Username', 'Username should be alphanumeric').isAlphanumeric()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    Users.findOne({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                return res.status(404).send("user not found");
            }
            res.status(200).json(user); 
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

  //Register new user
app.post('/users',
    // Validation logic here for request
    //you can either use a chain of methods like .not().isEmpty()
    //which means "opposite of isEmpty" in plain english "is not empty"
    //or use .isLength({min: 5}) which means
    //minimum value of 5 characters are only allowed
    [
      check('Username', 'Username is required').isLength({min: 5}),
      check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
      check('password', 'password is required').not().isEmpty(),
      check('email', 'email does not appear to be valid').isEmail()
    ], async (req, res) => {

    // check the validation object for errors
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      let hashedPassword = Users.hashPassword(req.body.password);
      await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
        .then((user) => {
          if (user) {
            //If the user is found, send a response that it already exists
            return res.status(400).send(req.body.Username + ' already exists');
          } else {
            Users
              .create({
                Username: req.body.Username,
                password: hashedPassword,
                email: req.body.email,
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
// Update user information
app.put("/users/:Username", passport.authenticate('jwt', { session: false }),[
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
        "Username",
        "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "password is required").not().isEmpty(),
    check("email", "email does not appear to be valid").isEmail(),
], async (req, res) => {
    let errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		let hashedPassword = Users.hashPassword(req.body.password);
    // Ensure the user is updating their own data
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // Update user data
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                password: req.body.password,
                email: req.body.email,
                //Birthday: req.body.Birthday,
            },
        },
        { new: true } // Return updated user document
    )
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// Add a movie to a user's favorite list
app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), [
    
    check('MovieID', 'MovieID should be a valid ID').isAlphanumeric()],
(req, res) => {
    // check validation
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    Users.findOneAndUpdate(
        { Username: req.params.Username }, // Find user by Username
        { $addToSet: { favoriteMovies: req.params.MovieID } }, // Add movie ID to favoriteMovies array
        { new: true } // Return updated user document
    )
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// Remove a movie from a user's favorite list
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), [
    check('MovieID', 'MovieID should be a valid ID').isAlphanumeric()  // Ensure MovieID is alphanumeric
],(req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username }, // Find user by Username
        { $pull: { favoriteMovies: req.params.MovieID } }, // Remove movie ID from favoriteMovies array
        { new: true } // Return updated user document
    )
    .then((updatedUser) => {
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        res.json(updatedUser); // Return the updated user document
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});

// Delete a user by username
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    // check validation
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { Username } = req.params;

    Users.findOneAndDelete({ Username: Username })  // Find user by Username and delete
        .then((deletedUser) => {
            if (!deletedUser) {
                return res.status(404).send("User not found");
            }
            res.status(200).json({ message: "User deregistered successfully" });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Error: " + err);
        });
});

// Start the server and listen on port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
