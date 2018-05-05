const mongoose = require("mongoose"),
      mongoosePaginate = require('mongoose-paginate');

require("dotenv").config({path:"variables.env"});

mongoose.Promise = global.Promise;


//conectar ao mongoDB via heroku
mongoose.connect(process.env.MONGODB_URI || process.env.LOCALHOST);

//conectar ao mongoDB via server decania
//mongoose.connect("mongodb://192.169.3.107/sitedecania");

//conectar ao mongoose via localHost
//mongoose.connect("mongodb://localhost/sitedecania");


module.exports = mongoose;
