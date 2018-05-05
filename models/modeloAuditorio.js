const mongoose = require("../mongoose");      

//scheme and model for auditorios
var auditorioSchema = new mongoose.Schema({  
    _id: String,
    nome: String,
    capacidade: Number,
    reservas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reserva"
        }
    ]
});
auditorioSchema.index({_id: 'text'});
var Auditorio = mongoose.model("Auditorio", auditorioSchema);


module.exports = Auditorio;