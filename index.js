/**
 * @fileOverview A simple Movie API built using Node.js, Express, and MongoDB (via Mongoose).
 * @requires express
 * @requires mongoose
 * @requires body-parser
 * @requires uuid
 * @requires express-validator
 * @requires cors
 * @requires passport
 */
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
/**
 * List of allowed origins for CORS
 * @type {Array<string>}
 */
let allowedOrigins = [
    'http://localhost:1234',
    'http://localhost:8080',
    'http://localhost:4200',
    'https://movie-api-padma-7528be21ca05.herokuapp.com',
    'https://padmajapinnika-1215.netlify.app',
    'https://padmajapinnika.github.io',
    'https://myflix-client.vercel.app'
  ];
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/**
 * Middleware to enable CORS for whitelisted origins.
 */
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
/**
 * Connect to MongoDB using Mongoose.
 * The connection URI is read from environment variables for security.
 */
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


/**
 * @route GET /
 * @group Welcome - Default entry route
 * @returns {string} 200 - Welcome message
 * @returns {Error}  default - Unexpected error
 * @example response - 200 - Success
 * "Welcome to my Movie API! Go to /documentation.html to view the documentation."
 */
app.get("/", (req, res) => {
    res.send("Welcome to MyFlix!")
});
/**
 * @route GET /movies
 * @group Movies - Operations related to movie listings
 * @security JWT
 * @summary Get all movies
 * @description This endpoint returns a list of all movies in the database. It is protected by JWT authentication.
 *
 * @returns {Array} 200 - A list of all movie objects
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get all movies
 * GET /movies
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Success
 * [
 *   {
 *     "_id": "605c72ef1532071d7c0bb1a0",
 *     "title": "Inception",
 *     "director": "Christopher Nolan",
 *     "year": 2010,
 *     "rating": 8.8,
 *     "genre": "Sci-Fi",
 *     "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
 *     "imageUrl": "https://image-url.com",
 *     "imageDescription": "Inception movie poster"
 *   },
 *   {
 *     "_id": "605c72ef1532071d7c0bb1a1",
 *     "title": "The Dark Knight",
 *     "director": "Christopher Nolan",
 *     "year": 2008,
 *     "rating": 9.0,
 *     "genre": "Action",
 *     "description": "When the menace known as The Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
 *     "imageUrl": "https://image-url.com",
 *     "imageDescription": "The Dark Knight movie poster"
 *   }
 * ]
 *
 * @example response - 500 - Server error
 * "Error: Server error: <error details>"
 */
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



/**
 * @route GET /movies/{title}
 * @group Movies - Operations related to movie listings
 * @security JWT
 * @summary Get a movie by its title
 * @description This endpoint returns a movie based on its title. It is protected by JWT authentication.
 *              If the movie is not found, a 404 error is returned.
 *
 * @param {string} title.path.required - The title of the movie to retrieve
 * 
 * @returns {Object} 200 - A movie object with details
 * @returns {Object} 404 - Movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Get a movie by title
 * GET /movies/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie details
 * {
 *   "_id": "605c72ef1532071d7c0bb1a0",
 *   "title": "Inception",
 *   "director": "Christopher Nolan",
 *   "year": 2010,
 *   "rating": 8.8,
 *   "genre": "Sci-Fi",
 *   "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
 *   "imageUrl": "https://image-url.com",
 *   "imageDescription": "Inception movie poster"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 *
 * @example response - 500 - Server error
 * "Server error: <error details>"
 */
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

/**
 * @route GET /users
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Get all users
 * @description Returns a list of all registered users. This route is protected and requires a valid JWT.
 * @returns {Array<Object>} 200 - An array of user objects
 * @returns {Error} 500 - Internal server error
 * 
 * @example request - Example JWT protected request
 * GET /users
 * Authorization: Bearer <your_token_here>
 * 
 * @example response - 200 - Success
 * [
 *   {
 *     "_id": "60e5f9aeb4d6a611d8b0c712",
 *     "Username": "johndoe",
 *     "Email": "john@example.com",
 *     "Birthday": "1990-01-01T00:00:00.000Z",
 *     "FavoriteMovies": []
 *   },
 *   ...
 * ]
 */
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


/**
 * @route GET /users/:username
 * @middleware passport.authenticate('jwt')
 * @description Retrieves a user by their username.
 * 
 * @param req - The Express request object, containing the `username` parameter.
 * @param res - The Express response object used to send back the desired HTTP response.
 * 
 * @returns {200} Returns the user object if found.
 * @returns {404} Returns an error message if the user is not found.
 * @returns {500} Returns a server error message if something goes wrong during the process.
 */
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

  /**
 * @route POST /users
 * @group Users - Operations related to user accounts
 * @summary Register a new user
 * @description This endpoint registers a new user with the application. The user must provide a unique username, a valid email, and a password.
 *              Input is validated for minimum length and format. Passwords are hashed before storage.
 * @param {Object} req.body - The user details
 * @param {string} req.body.username - The username (must be alphanumeric and at least 5 characters)
 * @param {string} req.body.password - The password (required)
 * @param {string} req.body.email - The user's email (must be valid)
 * @param {string} [req.body.firstName] - The user's first name (optional)
 * @param {string} [req.body.lastName] - The user's last name (optional)
 * @param {string} [req.body.birthday] - The user's birthday (optional, in ISO format)
 * 
 * @returns {Object} 201 - Successfully created user object
 * @returns {Object} 400 - Username already exists
 * @returns {Object} 422 - Validation errors
 * @returns {Error} 500 - Internal server error
 *
 * @example request - example registration input
 * {
 *   "username": "janedoe",
 *   "password": "securePassword123",
 *   "email": "jane@example.com",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "birthday": "1995-04-10"
 * }
 *
 * @example response - 201 - Created
 * {
 *   "_id": "609dcd9c9e1b8b0015b708c4",
 *   "username": "janedoe",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "email": "jane@example.com",
 *   "birthday": "1995-04-10T00:00:00.000Z",
 *   "FavoriteMovies": []
 * }
 */
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
/**
 * @route PUT /users/{username}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Update user information
 * @description Allows an authenticated user to update their own account information. 
 *              The user must match the username in the route to make changes. 
 *              Input is validated, and the password is hashed before storing.
 *
 * @param {string} username.path.required - Username of the user to update
 * @param {Object} req.body - User details to update
 * @param {string} req.body.username - New username (must be alphanumeric, min 5 characters)
 * @param {string} req.body.password - New password (required)
 * @param {string} req.body.email - New email (must be valid)
 * @param {string} [req.body.firstName] - Updated first name (optional)
 * @param {string} [req.body.lastName] - Updated last name (optional)
 * @param {string} [req.body.birthday] - Updated birthday (optional, ISO 8601 format)
 * 
 * @returns {Object} 200 - Updated user object
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 422 - Validation errors
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example update input
 * {
 *   "username": "janedoeUpdated",
 *   "password": "newSecurePassword123",
 *   "email": "jane.updated@example.com",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "birthday": "1995-04-10"
 * }
 *
 * @example response - 200 - Success
 * {
 *   "_id": "609dcd9c9e1b8b0015b708c4",
 *   "username": "janedoeUpdated",
 *   "firstName": "Jane",
 *   "lastName": "Doe",
 *   "email": "jane.updated@example.com",
 *   "birthday": "1995-04-10T00:00:00.000Z",
 *   "FavoriteMovies": []
 * }
 */
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

/**
 * @route POST /users/{username}/favorites/{movieTitle}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Add a movie to a user's favorites
 * @description This endpoint allows a user to add a movie to their favorites list. The request is protected by JWT, 
 *              and the user can only add movies to their own favorites list (based on username).
 *              If the movie is already in the user's favorites, it won't be added again.
 *
 * @param {string} username.path.required - The username of the user whose favorites list is being updated
 * @param {string} movieTitle.path.required - The title of the movie to add to the favorites list
 * 
 * @returns {Object} 200 - Success message with the updated list of favorite movie IDs
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 404 - User or movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example movie added to favorites
 * POST /users/janedoe/favorites/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie added to favorites
 * {
 *   "message": "Movie added to favorites!",
 *   "favorites": ["605c72ef1532071d7c0bb1a0", "605c72ef1532071d7c0bb1a1"]
 * }
 *
 * @example response - 400 - Permission denied
 * "Permission denied"
 *
 * @example response - 404 - User not found
 * {
 *   "message": "User not found!"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 */
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

/**
 * @route DELETE /users/{username}/favorites/{movieTitle}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Remove a movie from a user's favorites
 * @description This endpoint allows an authenticated user to remove a movie from their favorites list. 
 *              The user can only remove movies from their own favorites list (based on username).
 *              If the movie is not in the user's favorites, a 400 error is returned.
 *
 * @param {string} username.path.required - The username of the user whose favorites list is being updated
 * @param {string} movieTitle.path.required - The title of the movie to remove from the favorites list
 * 
 * @returns {Object} 200 - Success message with confirmation that the movie was removed
 * @returns {Object} 400 - Movie not found in favorites
 * @returns {Object} 400 - Permission denied (username mismatch)
 * @returns {Object} 404 - User or movie not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Example remove movie from favorites
 * DELETE /users/janedoe/favorites/Inception
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Movie removed from favorites
 * {
 *   "message": "Movie 'Inception' has been removed from janedoe's favorites."
 * }
 *
 * @example response - 400 - Movie not found in favorites
 * {
 *   "message": "Movie not found in favorites!"
 * }
 *
 * @example response - 400 - Permission denied
 * "Permission denied"
 *
 * @example response - 404 - User not found
 * {
 *   "message": "User not found!"
 * }
 *
 * @example response - 404 - Movie not found
 * {
 *   "message": "Movie not found!"
 * }
 */
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

/**
 * @route DELETE /users/{username}
 * @group Users - Operations related to user accounts
 * @security JWT
 * @summary Deregister a user
 * @description Deletes a user account by username. The request must be authenticated with a valid JWT.
 *
 * @param {string} username.path.required - Username of the user to delete
 * 
 * @returns {string} 200 - Confirmation message that the user was deleted
 * @returns {string} 400 - User not found
 * @returns {Error} 500 - Internal server error
 *
 * @example request - Authenticated deletion
 * DELETE /users/janedoe
 * Authorization: Bearer <your_token_here>
 *
 * @example response - 200 - Success
 * "janedoe was deleted."
 *
 * @example response - 400 - User not found
 * "janedoe was not found"
 */
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
