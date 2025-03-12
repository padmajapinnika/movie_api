const mongoose=require('mongoose');
let movieSchema=mongoose.Schema({
    title:{type:String,required:true},
    description:{type:String,required:true},
    genre:{
        name:String,
        genreDescription:String
    },
    director: {
        name:String,
        bio:String,
        birthYear: { type: Number },
        deathYear: { type: Number, default: null }
    },
    Actors:[String],
    ImagePath:String,
    Featured:Boolean,
    releaseYear: { type: Number },
    duration: { type: Number },
    rating: { type: Number }
});
let userSchema=mongoose.Schema({
    Username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    Birthday: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
});
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
module.exports.Movie = Movie;
module.exports.User = User;