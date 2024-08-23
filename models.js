const mongoose = require ('mongoose');

//schema is defined through a set of keys and values that will dicate the format for documents of a certian collection
let movieSchema = mongoose.Schema({
    Title: {type: String, required: true},
    Description: {type:String, required:true},
    Genre:{
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String
    },
    Actors:[String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId,ref: 'Movie'}]
});


//documents have been defined in each the movie and user colelctions
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


//exporting my models to index.js
module.exports.Movie = Movie;
module.exports.User = User;
