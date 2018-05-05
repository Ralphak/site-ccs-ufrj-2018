//CONFIRMANDO OU RECUSANDO RESERVAS
var emAnalise = [],
    idReserva,
    obs,
    body = document.getElementsByTagName("body")[0];


let confirmarAcao = (acao, e) => {
    document.getElementById(`input-${acao}-reserva`).value = e.target.parentElement.parentElement.parentElement.id;
    variaveisGlobais.controlarVisibilidade("exibir", `#form-${acao}-reserva`);
    variaveisGlobais.controlarVisibilidade("exibir", "#overlay");
    body.classList.add("fixo");
    
    if (acao === 'confirmar') {
        let conflito = document.querySelectorAll(`#detalhes-${e.target.parentElement.parentElement.parentElement.id} .conflito`);
        for (let i = 0; i < conflito.length; i++) {
            document.getElementById(`form-confirmar-reserva`).insertAdjacentHTML('afterbegin', `
                <input type="text" name = "excluirReserva" id="excluir-pedido-${conflito[i].dataset.idconflito}" readonly class="hidden" value = ${conflito[i].dataset.idconflito}>`
            );
        }
    }
};
document.querySelector(".analise-requisicoes").addEventListener("click", function(e) {
    if (e.target.classList.contains("botao") && e.target.classList.contains("confirmar")) {
        confirmarAcao('confirmar', e);
    }
    if (e.target.classList.contains("botao") && e.target.classList.contains("recusar")) {
        confirmarAcao('recusar', e);
    }

    //exibindo e ocultando detalhes da reserva
    if (e.target.classList.contains("detalhes-plus") || e.target.classList.contains("card-img") || e.target.classList.contains("card-evento")) {
        variaveisGlobais.controlarVisibilidade("exibir", "#detalhes-" + e.target.parentElement.parentElement.id);
        variaveisGlobais.controlarVisibilidade("exibir", "#overlay");
        body.classList.add("fixo");
    }
    if (e.target.classList.contains("button-fechar")) {
        variaveisGlobais.controlarVisibilidade("ocultar", `#${e.target.parentElement.parentElement.id}`);
        variaveisGlobais.controlarVisibilidade("ocultar", "#overlay");
        body.classList.remove("fixo");
    }

});

//cancelando ou confirmando as reservas - tela de confirmação
document.getElementById("form-recusar-reserva").addEventListener("click", function(e){
    if (e.target.classList.contains("retornar")) {
        e.preventDefault();
        document.getElementById("input-confirmar-reserva").value = "";
        variaveisGlobais.controlarVisibilidade("ocultar", "#form-recusar-reserva");
        variaveisGlobais.controlarVisibilidade("ocultar", "#overlay");
        body.classList.remove("fixo");
    }
});

document.getElementById("form-confirmar-reserva").addEventListener("click", function(e){
    if (e.target.classList.contains("retornar")) {
        e.preventDefault();
        document.getElementById("input-confirmar-reserva").value = "";
        variaveisGlobais.controlarVisibilidade("ocultar", "#form-confirmar-reserva");
        variaveisGlobais.controlarVisibilidade("ocultar", "#overlay");
        body.classList.remove("fixo");
    }
});

//carregando o status de requisições e aprovados
var statusRequisicoes = function(reservas) {
    var requisitado = false, agendado = false;
    for (let i = 0; i < reservas.length; i++) {
        if (reservas[i].status === "requisitado") {
            if (requisitado) {
                continue;
            }
            requisitado = true;
        }
        if (reservas[i].status === "agendado") {
            if (agendado) {
                continue;
            }
            agendado = true;
        }
    }
    if (!requisitado) {
        document.querySelector(".status-requisicoes").innerHTML = "Não há requisições pendentes";
    }
    if (!agendado) {
        document.querySelector(".status-agendados").innerHTML = "Não há eventos previstos";
    }
};

//geração das requisições no DOM
var pedidosDiv = function(seletor, arrayDados) {    
    let html = "";
    for (let i = 0; i < arrayDados.length; i++) {
        let conflitosDOM = '', alertaConflito = '';
        let conflitosHorario = concomitancias(arrayDados[i]._id, arrayDados[i].auditorio, arrayDados[i].horarios, arrayDados);
        if (conflitosHorario.length === 0) {
            conflitosDOM = ''
        } else {
            alertaConflito = `<i class='fa fa-exclamation-triangle icone-conflito'></i><span class='dica conflito-dica'>Há conflito de horário com outros pedidos. Confira os pedidos concomitantes na guia "+ detalhes"</span>`;
            conflitosDOM = '<div class="conflitos-horario-div"><p> <strong> Conflitos de horário:</strong></p>';
            for (let i = 0; i < conflitosHorario.length; i++) {
                conflitosDOM += `<p class='conflito' data-idconflito='${conflitosHorario[i]._id}'>${conflitosHorario[i].evento}</p>`;
            }
            conflitosDOM +='</div>'
        }
        let registros = "";
        let botoes;
        for (let j = 0; j < arrayDados[i].registros.length; j++) {
            let horario = moment(arrayDados[i].registros[j].data).format("DD/MM/YYYY HH:mm");
            registros += `<p><strong>${horario}</strong> | ${arrayDados[i].registros[j].texto}</p>`;            
        }
        if (seletor === ".requisicoes-reservas-div") {
            botoes = `<div class="card-buttons">
            <button class="botao confirmar">confirmar</button>
            <button class="botao recusar">recusar</button>
            </div>`;
        } else {
            botoes = `<div class="card-buttons">
            <button class="botao recusar">cancelar reserva</button>
            </div>`;
        }  
        
        if (!arrayDados[i].observacoes) {
            arrayDados[i].observacoes = "";
        }
        html += `        
        <div class="card" id="${arrayDados[i]._id}" data-auditorio=${arrayDados[i].auditorio}>
            <div class="card-cabecalho">
                ${alertaConflito}
                <div class="card-img ${arrayDados[i].auditorio}">
                </div>
                <h3 class="card-evento">${arrayDados[i].evento}</h3>
            </div>
            <div class="card-body">
                <h3 class="natureza">${arrayDados[i].naturezaEvento}</h3>
                <div class="resumo-horarios" id="horarios-${arrayDados[i]._id}">
                </div>
                ${botoes}
                <div class="detalhes-plus">
                    <i class="fa fa-plus"></i>
                    <span>detalhes</span>
                </div>
            </div>
            <div class="janela hidden opacidade-zero" id="detalhes-${arrayDados[i]._id}">                
                <h2 class="header">Detalhamento do pedido:</h2>
                <p> <strong> Evento:</strong> ${arrayDados[i].evento}</p>
                <p> <strong> Responsável:</strong> ${arrayDados[i].nomeResponsavel}</p>
                <p> <strong> Auditório:</strong> ${arrayDados[i].auditorioNome}</p>
                <p> <strong> Público:</strong> ${arrayDados[i].publico} pessoas</p>
                <p> <strong> Natureza do evento:</strong> ${arrayDados[i].naturezaEvento}</p>
                <p> <strong> Especificações do pedido:</strong> ${arrayDados[i].informacoesComplementares}</p>
                <div class="detalhes-horarios-${arrayDados[i]._id}">        
                    <p><strong> Horários:</strong></p>                    
                </div>
                <p>${conflitosDOM}</p>
                <div class="div-registros"> 
                    ${registros}
                </div>
                <div class="observacoes observacoes-${arrayDados[i]._id}">
                    <div class="formulario">
                        <label for="obs"><p>observações:</p></label>
                        <textarea id="obs-${arrayDados[i]._id}" name="obs" value="${arrayDados[i].observacoes}">${arrayDados[i].observacoes}</textarea>
                    </div>
                    <div class="button-div">
                        <button class="salvar-observacoes">Salvar observações</button>
                    </div>
                </div>
                <div class="button-div">
                    <button class="button-fechar">voltar</button>
                </div>
            </div>
        </div>`;        
    }
    document.querySelector(seletor).insertAdjacentHTML("beforeend", html);  
}

//geração do DIV de horários
function horariosDOMCard (reservas) {
    for (let i = 0; i < reservas.length; i++) {
        intervaloDias(reservas[i].horarios, reservas[i]._id);
        intervaloHorarios(reservas[i].horarios, reservas[i]._id);
    }
}

//exibe dias no card do pedido de reserva
function intervaloDias(horarios, reservaID) {
    var segmentos = 0,
        intervalos = [],
        string = "";
    horarios.sort();
    for (let j = 0; j < horarios.length; j++) {
        if (j === 0) {
            intervalos.push([horarios[0]]);
        } else {
            var hora = horarios[j].substr(0,10),
                horaAnterior = horarios[j-1].substr(0,10);
            if (moment(hora).format("YYYY-MM-DD") === moment(horaAnterior).format("YYYY-MM-DD") || moment(hora).format("YYYY-MM-DD") === moment(horaAnterior).add(1, "days").format("YYYY-MM-DD")) {
                intervalos[segmentos].push(horarios[j]);
            } else if (moment(hora).format("YYYY-MM-DD") === moment(horaAnterior).add(3, "days").format("YYYY-MM-DD") ) {
                intervalos[segmentos].push(horarios[j]);
            } else {
                segmentos++;
                intervalos.push([]);
                intervalos[segmentos].push(horarios[j]);
            }
        }
    }
    for (let i = 0; i < intervalos.length; i++) {
        var firstDay = intervalos[i][0].substr(0,10),
            lastDay = intervalos[i][intervalos[i].length - 1].substr(0,10);
        if (moment(firstDay).add(1, "days").format("DD") === moment(lastDay).format("DD") || moment(firstDay).day() === 5 && moment(firstDay).add(3, "days").format("DD") === moment(lastDay).format("DD")) {
            if (moment(firstDay).format("MM") === moment(lastDay).format("MM")){
                string += "<p>" + moment(firstDay).format("DD [e] ") + moment(lastDay).format("DD [de] MMM") + "</p>";
            } else {
                string += "<p>" + moment(firstDay).format("DD [de] MMM [e] ") + moment(lastDay).format("DD [de] MMM") + "</p>";
            }
        } else if (firstDay === lastDay && moment(firstDay).add(1, "days").format("MM") === moment(lastDay).format("MM")) {
            string += "<p>" + moment(firstDay).format("DD [de] MMM") + "</p>";
        } else if (moment(firstDay).format("MM") === moment(lastDay).format("MM")) {
            string += "<p>" + moment(firstDay).format("DD [a]") + moment(lastDay).format(" DD [de] MMM") + "</p>";
        } else {
            string += "<p>" + moment(firstDay).format("DD [de] MMM [a]") + moment(lastDay).format(" DD [de] MMM") + "</p>";
        }
    }
    document.getElementById("horarios-" + reservaID).innerHTML = string;
}

//exibe dias e horários no detalhamento do pedido de reserva
var intervaloHorarios = function(horarios, reservaID){
    var reserva;
    horarios.sort();
    reserva = `<div class = "reserva"><p><strong>${moment(horarios[0].substring(0,10)).format("DD [de] MMMM")}</strong><hr style="background-color: #ccc; width: 90%"></p>`;
    reserva += `<span>${horarios[0].substring(11,13)}:00 - ${variaveisGlobais.horaFim(Number(horarios[0].substring(11,13)))}:00</span><br>`;

    for (let k = 1; k < horarios.length; k++) {
        var horario = horarios[k].substring(11,13);
        if (horarios[k].substring(0,10) === horarios[k-1].substring(0,10)) {
            reserva += `<span>${horario}:00 - ${variaveisGlobais.horaFim(Number(horario))}:00</span><br>`;
        } else {
            reserva += "</div>";
            reserva += `<div class = reserva><p><strong>${moment(horarios[k].substring(0,10)).format("DD [de] MMMM")}</strong><hr style="background-color: #ccc; width: 90%"></p>`;
            reserva += `<span>${horario}:00 - ${variaveisGlobais.horaFim(Number(horario))}:00</span><br>`;
        }
    }
    reserva += "</div>";
    document.querySelector(".detalhes-horarios-" + reservaID).innerHTML = reserva;
};

//id: id da reserva[i]/ auditorio: auditório da reserva[i] / horarios: horários da reserva[i] / reservas: todas as reservas
let concomitancias = (id, auditorio, horarios, reservas ) => {
    let reservasDoAuditorio = [], reservasConflitantes = [];
    for (let i = 0; i < reservas.length; i++) {
        if(reservas[i].auditorio === auditorio && reservas[i]._id !== id) {
            reservasDoAuditorio.push(reservas[i]);
        }
    }
    for (let i = 0; i < reservasDoAuditorio.length; i++) {
        let conflitante = false;
        for (let j = 0; j < reservasDoAuditorio[i].horarios.length; j++) {
            for (let k = 0; k < horarios.length; k++) {
                if (reservasDoAuditorio[i].horarios[j] === horarios[k]) {
                    reservasConflitantes.push(reservasDoAuditorio[i]);
                    conflitante = true;
                    break;
                }
            }
            if (conflitante) {break};    
        }
    }
    return reservasConflitantes;
}

////////////////////////////////////////////////
////////////// BLOCO DE EXECUÇÕES //////////////
////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", async function(e){

    //recuperar as requisicoes em análise e aprovadas
    let todasRequisicoes = await variaveisGlobais.ajax("/reserva/analise/requisicoes", 'get');    

    //montando o div de requisições em análise e agendadas
    pedidosDiv(".requisicoes-reservas-div", todasRequisicoes[0]);
    pedidosDiv(".requisicoes-agendados-div", todasRequisicoes[1]);

    //recuperar itens agenda
    let todosHorarios = await variaveisGlobais.ajax('/recuperarHorarios', 'get');
    

    //checar atividades no intervalo
    let diasComEvento = await variaveisGlobais.checarAtividades(todosHorarios);

    //carregando o status de requisições e aprovados
    statusRequisicoes(todosHorarios);
   
    //exibir a hora das reservas nos cards
    horariosDOMCard(todosHorarios);
  

    //listeners
    document.querySelector(".analise-requisicoes").addEventListener("click", async function(e){
        if (e.target.classList.contains("salvar-observacoes")) {            
            e.preventDefault();
            idReserva = e.target.parentElement.parentElement.parentElement.id.split("-")[1];
            obs = document.getElementById(`obs-${idReserva}`).value;

            //alterando os campos editados no banco de dados
            var editada = await variaveisGlobais.ajax('/reserva/editar', 'post', {"id": idReserva,"obs": obs});

            //recuperando os novos dados no DOM
            document.getElementById(`obs-${idReserva}`).value = editada.observacoes;
            variaveisGlobais.exibirMensagem("As observações da reserva foram salvas", 2500);
        }
    });
});
