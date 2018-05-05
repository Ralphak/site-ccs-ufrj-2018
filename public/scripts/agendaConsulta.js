///////////////////////////////////////////////
////////////// VARIÁVEIS GLOBAIS //////////////
///////////////////////////////////////////////
var corOriginal,
    divHorarios = document.getElementById("horarios"),
    requisitado = false;

///////////////////////////////////////
////////////// LISTENERS //////////////
///////////////////////////////////////

//inserindo o preLoader
if (divHorarios) {
    divHorarios.insertAdjacentHTML("beforeend", `<img class="loading agenda-consulta" src="/img/loading.svg">`);
}

//exibição da janela com uma breve descrição, ao clicar sobre um evento na agenda em sua verão mobile
    var exibirDicaEvento = (function(){
        //exibindo a janela
        if (divHorarios) {
            divHorarios.addEventListener("mouseenter", function(e){
                if (e.target.classList.contains("aud")) {
                    if(!variaveisGlobais.desktopDef) {
                        if (e.target.getBoundingClientRect().top > window.innerHeight/2) {
                            e.target.firstElementChild.style.top = e.target.getBoundingClientRect().top - 120 + "px";
                        } else {
                            e.target.firstElementChild.style.top = e.target.getBoundingClientRect().top + 120 + "px";
                        }
                    } else {
                        if (e.target.getBoundingClientRect().left > window.innerWidth/1.6) {
                            e.target.firstElementChild.style.left = -325 + "px";
                        } else {
                            e.target.firstElementChild.style.left = 100 + "px";
                        }
                    }
                    document.getElementById(e.target.firstElementChild.id).classList.toggle("hidden");

                    //seleciona todos os horários da mesma reserva
                    corOriginal = e.target.style.backgroundColor;
                    let todosHorarios = document.getElementsByClassName(e.target.classList[0]);
                    for(let i = 0; i < todosHorarios.length; i++){
                        todosHorarios[i].style.backgroundColor = "#d9b08c";
                    }
                }
            }, true);
            //ocultando a janela
            if (document.getElementById("consulta-agenda")) {
                document.getElementById("consulta-agenda").addEventListener("mouseout", function(e){
                    if (e.target.classList.contains("aud")) {
                        document.getElementById(e.target.firstElementChild.id).classList.toggle("hidden");
                    }
                    let todosHorarios = document.getElementsByClassName(e.target.classList[0]);
                    for(let i = 0; i < todosHorarios.length; i++){
                        todosHorarios[i].style.backgroundColor = corOriginal;
                    }
                });
            }
        }
    })();

/////////////////////////////////////
////////////// FUNÇÕES //////////////
/////////////////////////////////////

//insere a estrutura da agenda no DOM:
var horariosDOM = function(idWrapper) {
    var content = "";
    for (let i = 0; i < variaveisGlobais.intervalos.length; i++) {
        content += '<div class="horario" id="' + ("0" + variaveisGlobais.intervalos[i]).slice(-2) +'"><span>' + ("0" + variaveisGlobais.intervalos[i]).slice(-2) + 'h - ' + variaveisGlobais.horaFim(variaveisGlobais.intervalos[i]) + 'h</span><div class="reservas-auditorios"></div></div>';
    }
    document.getElementById(idWrapper).insertAdjacentHTML("beforeend", content);
};

//recuperar as reservas via AJAX
var agendaConsulta = function() {
    variaveisGlobais.removePreLoaders(".agenda-consulta");
};

//Verificar os dias em que há atividades no intervalo para exibir no datepicker:
var checarAtividades = function (reservas) {
    var todasReservas = [];
    var diasComEvento = [];   //array com os dias em que há atividade
    var dataInicio = variaveisGlobais.antecedenciaMinima;
    //var encontrou = false;
    var numDias = moment(new Date()).add(variaveisGlobais.antecedenciaMaximaNumber, "months").diff(moment(new Date()).subtract(Math.abs(dataInicio), "days"), "days");
    numDias -= Math.abs(dataInicio);

    //agrupando todos os horários de todas as reservas
    for (let i = 0; i < reservas.length; i++) {
        for (let j = 0; j < reservas[i].horarios.length; j++) {
            todasReservas.push(reservas[i].horarios[j])
        }
    }
    //confrontando os horários e os dias
    for (var i = 0; i <= numDias; i++) {
        var temAtividade;
        for (let j = 0; j < todasReservas.length; j++) {
            if (moment(new Date()).add(variaveisGlobais.antecedenciaMinima + i, "days").format("YYYY-MM-DD") === moment(todasReservas[j].substr(0,10)).format("YYYY-MM-DD")) {
                temAtividade = true;
                break;
            }
        }
        if (temAtividade) {
            diasComEvento.push(moment(new Date()).add(variaveisGlobais.antecedenciaMinima + i, "days").toISOString());
        }
        temAtividade = false;
    }
    return diasComEvento;
};

//controlando a exibição das setas da agenda de dias
var controlarSetas = function() {
    if (moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(variaveisGlobais.antecedenciaMinima, "days").format("DD-MM-YYYY")) {
    document.querySelector(".fa-caret-left").classList.add("inactive");
    } else {
        document.querySelector(".fa-caret-left").classList.remove("inactive");
    }
    if (moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(variaveisGlobais.antecedenciaMaximaNumber, "months").subtract(variaveisGlobais.antecedenciaMaximaSub, "days").format("DD-MM-YYYY")) {
        document.querySelector(".fa-caret-right").classList.add("inactive");
    } else {
        document.querySelector(".fa-caret-right").classList.remove("inactive");
    }
};

////////////////////////////////////////////////
////////////// BLOCO DE EXECUÇÕES //////////////
////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", function(e){

    if (!document.querySelector(".reservar-auditorio") && document.getElementById("secao-agenda")) {

        document.getElementsByTagName("body")[0].addEventListener('click', async function(e) {          
            if ((e.target.classList.contains("abertura-div-angle") || e.target.classList.contains("div-icon") || e.target.classList.contains("agenda-desktop-clicavel")) /* && !requisitado */) {
                //inserir a estrutura dos horários da agenda no DOM
                horariosDOM("horarios");
                
                //recuperar itens agenda
                variaveisGlobais.reservas = await variaveisGlobais.ajax("/recuperarReservas", "get", { status: "agendado"},agendaConsulta);
                
                //checar atividades no intervalo
                var diasComEvento = await checarAtividades(variaveisGlobais.reservas);                
                
                //inicializar datepicker
                await variaveisGlobais.datepicker(diasComEvento, false);

                //exibir a agenda do dia selecionado
                variaveisGlobais.exibirDiaConsulta(variaveisGlobais.reservas);

                //Controlando a exibição no datepicker pela agenda diária
                variaveisGlobais.controleDatepicker();
                
                //requisitarequisitado = true;
            }
        });
    }
});
