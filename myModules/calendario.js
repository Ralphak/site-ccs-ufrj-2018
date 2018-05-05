"use strict";
const moment = require("moment");
moment.locale("pt-br");

//geração dos horários nas linhas da agenda diária
var horariosDOM = function(horarios){
    var reserva;
    
    horarios.sort();
    
    reserva = `<div class = "reserva"><p><strong>${moment(horarios[0].substring(0,10)).format("DD")} de ${moment(horarios[0].substring(0,10)).format("MMMM")}</strong><hr style="background-color: #ccc; width: 100%"></p>`;
    reserva += `<span>${horarios[0].substring(11,13)}:00 - ${horaFim(Number(horarios[0].split("-")[3]))}</span><br>`;

    for (let i = 1; i < horarios.length; i++) {                    
        if (horarios[i].substring(0,10) === horarios[i-1].substring(0,10)) {
            reserva += `<span>${horarios[i].substring(11,13)}:00 - ${horaFim(Number(horarios[i].split("-")[3]))}</span><br>`;
        } else {
            reserva += "</div>";
            reserva += `<div class = reserva><p><strong>${moment(horarios[i].substring(0,10)).format("DD")} de ${moment(horarios[i].substring(0,10)).format("MMMM")}</strong><hr style="background-color: #ccc; width: 100%"></p>`;
            reserva += `<span>${horarios[i].substring(11,13)}:00 - ${horaFim(Number(horarios[i].split("-")[3]))}</span><br>`;
        }
    }
    reserva += "</div>";
    return reserva;
};

//especifica a hora final de um certo horário, a partir de sua hora inicial
    var horaFim = function(horaInicio) {
        if(horaInicio == 12 || horaInicio == 17){
            return ("0" + (horaInicio + 1)).slice(-2) + ":00";
        } else {
            return ("0" + (horaInicio + 2)).slice(-2) + ":00";
        }
    }
    
module.exports = {
    horariosDOM
};