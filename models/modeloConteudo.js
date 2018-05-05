const mongoose = require("../mongoose"),
      mongoosePaginate = require('mongoose-paginate');

//scheme and model for conteudos
var conteudoSchema = new mongoose.Schema({
    _id: String,
    data: Date,
    dataAmigavel: String,
    natureza: String,
    subtipo: String,
    titulo: String,
    resumo: String,
    imagem: Boolean,
    liveVideo: Boolean,
    dataDeExibicao: String,
    midia: String,
    tag: [],
    texto: String,
    autor: String,
    legenda: String,
    temDocumento: Boolean    
});
conteudoSchema.plugin(mongoosePaginate);
conteudoSchema.index({titulo: 'text', tag: 'text'});
var Conteudo = mongoose.model("Conteudo", conteudoSchema);

module.exports = Conteudo;
