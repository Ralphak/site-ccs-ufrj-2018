const mongoose = require("../mongoose");

var osSchema = new mongoose.Schema({
    _id: String,
    oficina: String,
    encarregado: String,
    matNome: [],
    matQuant: [],
    epi: String,
    dataAbertura: Date,
    descricao: String,
    obs: String,
    executada: Boolean,
    executor: String,
    dataFinalizacao: Date,
    consideracoes: String
});

osSchema.index({_id: 'text', oficina: 'text', os: 'text'});

var Os = mongoose.model("Os", osSchema);

module.exports = Os;
