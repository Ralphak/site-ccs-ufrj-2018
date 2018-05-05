const mongoose = require("../mongoose"),
      mongoosePaginate = require('mongoose-paginate');

var cargoSchema = new mongoose.Schema({
    contexto: String,
    cargo: String
}, {_id:false});      
//scheme and models for contatos
var contatoSchema = new mongoose.Schema({
    nome : String,
    foto: Boolean,
    email : String,
    telefone : String,
    vinculo : String,
    unidade: String,
    cargos: [cargoSchema],
    senha: String,
    grupos: [],
    permissoes: {
        reservarAuditorios: Boolean,
        analisarReservaAuditorios: Boolean,
        chefeManutencao: Boolean,
        gerenteSistema: Boolean
    }
});
contatoSchema.plugin(mongoosePaginate);
contatoSchema.index({'$**': 'text'});
var Contato = mongoose.model("Contato", contatoSchema);

module.exports = Contato;
