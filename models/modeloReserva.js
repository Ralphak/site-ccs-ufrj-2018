const mongoose = require("../mongoose");

//scheme and model for reservas
var reservaSchema = new mongoose.Schema({
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
    observacoes: String,
    horarios: []
});

reservaSchema.index({auditorio: 'text', horarios: 'text'});

var Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;
