const mongoose = require("../mongoose");

//scheme and model for reservas
var reservaConcluidaSchema = new mongoose.Schema({
    requerente: String,
    registrador: String,
    evento: String,
    auditorio: String,
    auditorioNome: String,
    nomeResponsavel: String,
    emailResponsavel: String,
    telResponsavel: String,
    publico: Number,
    naturezaEvento: String,
    informacoesComplementares: String,
    registros: [
        {
            data: Date,
            texto: String
        }
    ],
    status: String,
    horarios: []
});

reservaConcluidaSchema.index({auditorio: 'text', horarios: 'text'});

var ReservaConcluida = mongoose.model("ReservaConcluida", reservaConcluidaSchema);



module.exports = ReservaConcluida;
