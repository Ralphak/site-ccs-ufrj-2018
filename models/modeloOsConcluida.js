const mongoose = require("../mongoose");

var osConcluidaSchema = new mongoose.Schema({
    _id: String,
    oficina: String,
    encarregado: String,
    matNome: [],
    matQuant: [],
    epi: String,
    dataAbertura: Date,
    descricao: String,
    obs: String,
    executado: Boolean,
    executor: String,
    dataFinalizacao: Date,
    consideracoes: String
});

osConcluidaSchema.index({_id: 'text', oficina: 'text', ds: 'text'});

var OsConcluida = mongoose.model("OsConcluida", osConcluidaSchema);

module.exports = OsConcluida;
