// Import necessary modules
const express = require('express');
const morgan = require("morgan");
const mongoose = require('mongoose');
const uuid = require('uuid');
const Models = require('./models.js');
const passport=require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;
const Genres=Models.Genre;
const Directors=Models.Director;
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let auth = require('./auth')(app);
require('./passport');

//mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connect(process.env.CONNECTION_URI,  { useNewUrlParser: true, useUnifiedTopology: true })
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));
//default text response when at /
app.get("/",(req,res)=>{
    res.send("welocome to MyFlix!")
});
//return movies in json format
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
   await  Movies.find()
    .then((movies)=>{
        res.status(201).json(movies);
    })
.catch((err)=>{
    console.error(err);
    res.status(500).send("Erorr:"+err);
});
});
////return users in json format
app.get("/users",passport.authenticate('jwt', { session: false }),function(req,res){
    Users.find()
    .then(function(users){
        res.status(201).json(users);
    })
    .catch(function(err){
        cojsole.error(err);
        res.status(500).send("Error:"+err);
    });
});

app.get("/movies/:title", passport.authenticate('jwt', { session: false }),(req, res) => {
    Movies.findOne({ Title:req.params.Title })
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

app.get("/genre/:name",  passport.authenticate('jwt', { session: false }),(req, res) => {

    // Search for a movie with the given genre name inside the genre field of the Movie model
    Movies.findOne({ "genre.name": req.params.name })
        .then((movie) => {

            res.json({
                Genre: movie.genre.name,
                Description: movie.genre.genreDescription
            });
        })
        .catch((err) => {
            console.error(err);  // Log the error details
            res.status(500).send("Error:" + err.message);
        });
});

app.get("/director/:name", passport.authenticate('jwt', { session: false }), (req, res) => {
    // Search for a movie with the given director name inside the director field of the Movie model
    Movies.findOne({ "director.name": req.params.name })   // Correct query field name
        .then((movie) => {
            // Return the director's bio, birth year, and death year
            res.json({
                Director: movie.director.name,
                Bio: movie.director.bio,
                BirthYear: movie.director.birthYear,
                DeathYear: movie.director.deathYear
            });
        })
        .catch((err) => {
            console.error(err);  // Log the error details
            res.status(500).send("Error: " + err.message);
        });
});

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
      check('email', 'Email does not appear to be valid').isEmail()
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
app.put("/users/:Username", passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({Username: req.params.Username },
        {
            $set: {
                Username: req.body.Username,
                password: req.body.password,
                email: req.body.email,
                Birthday: req.body.Birthday,
            },
        },
        { new: true }
    )
    .then((updatedUser)=>{
        res.json(updatedUser);
    } )
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });   
});
app.post("/users/:Username/movies/:MovieID",  passport.authenticate('jwt', { session: false }),(req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username }, // Find user by Username
        { $addToSet: { favoriteMovies: req.params.MovieID } }, // Add movie ID to the array
        { new: true } // Return the updated user document
    )
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
    });
});
app.delete("/users/:Username/movies/:MovieID",  passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.Username }, // Find user by Username
        { $pull: { favoriteMovies: req.params.MovieID } }, // Remove movie ID from the FavoriteMovies array
        { new: true } // Return the updated user document
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
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    const { Username } = req.params;

    Users.findOneAndDelete({ Username: Username })  // Find the user by Username and delete them
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
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});