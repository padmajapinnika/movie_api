// Import necessary modules
const express = require('express');
const uuid = require('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres=Models.Genre;
const Directors=Models.Director;

mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let auth = require('./auth')(app);
const passport=require('passport')
require('./passport');


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

app.post("/users",(req,res)=>{
    Users.findOne({Username:req.body.Username})
    .then((user) => {
        if(user){
            return res.status(400).send(req.body.Username+"User already exists");
        } else {
Users.create({
    Username:req.body.Username,
    password:req.body.password,
    email:req.body.email,
    Birthday:req.body.birthday,
})
.then((user)=>{
    res.status(201).json(user);
})
.catch((error)=>{
    console.error(error);
    res.status(500).send("Error:"+error)
});
        }
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
