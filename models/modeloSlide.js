const mongoose = require("../mongoose");      

//scheme and model for slides
var slideSchema = new mongoose.Schema({    
    titulo: String,
    arquivo: String,
    selecionado: Boolean,
    texto: String,
    resumo: String, 
    right: Boolean
});
var Slide = mongoose.model("Slide", slideSchema);


module.exports = Slide;