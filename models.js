const mongoose = require ('mongoose');
const bcrypt = require('bcrypt');

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
        Bio: String,
        Birth: String,
        Death: String
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

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};



//documents have been defined in each the movie and user colelctions
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


//exporting my models to index.js
module.exports.Movie = Movie;
module.exports.User = User;
