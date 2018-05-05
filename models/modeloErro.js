const mongoose = require("../mongoose");      

//scheme and model for slides
var erroSchema = new mongoose.Schema({    
    data: Date,
    log: String
});
var Erro = mongoose.model("Erro", erroSchema);


module.exports = Erro;