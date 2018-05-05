const mongoose = require("../mongoose");
      

//scheme and model for conteudos
//consultar o manual de utilização para esclarecimentos sobre as propriedades do esquema
var documentoSchema = new mongoose.Schema({
    _id: String,
    pagina: String,
    tipo: String,
    nomeAmigavel: String,   
    tipoSessao: String,
    numeroSessao: Number,
    dataSessao: Date, 
    ano: Number     
});

var Documento = mongoose.model("Documento", documentoSchema);

module.exports = Documento;