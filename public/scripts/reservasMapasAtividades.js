var header = `
    <div id="mapa-header">
        <div class="marca"></div>
    </div>
`;

//recuperar os horários via AJAX
var recuperarAuditorios = async function() {
    var todosAuditorios;
    await $.ajax({type: 'GET',
        url: "/recuperarAuditorios",
        //data: {"auditorio":"qualquer"},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            todosAuditorios = msg
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
    return todosAuditorios;
};

//recuperar os horários via AJAX
var recuperarReservas = async function() {
    var todasReservas;
    await $.ajax({type: 'GET',
        url: "/recuperarReservas",
        //data: {"auditorio": auditorioID},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            todasReservas = msg
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
    return todasReservas;
};

//Exibir a lista de auditórios no DOM
var auditoriosDOM = function(aud) {
    var content = "";
    for (let i = 0; i < aud.length; i++) {
        content += `
            <div id="${aud[i]._id}" class="auditorio">
            <img src="/img/auditorios/${aud[i]._id}.jpg">
            <h3 class="nome">${aud[i].nome}</h3>
            <p>Capacidade: ${aud[i].capacidade} pessoas</p>
            </div>`;
    }
    document.querySelector(".auditorios-wrapper").insertAdjacentHTML("beforeend", content);
};

var filtrarReservas = function(auditorio, reservas) {
    var reservasFiltradas = [];
    //seleciona apenas as reservas do auditório em questão
    for (let i = 0; i < reservas.length; i++) {
        if (reservas[i].auditorio === auditorio && reservas[i].status === "agendado") {
            reservasFiltradas.push(reservas[i]);
        }
    }
    return reservasFiltradas
};

/*selecionar os horários em funçao do auditório selecionado e da semana. O parâmetro "periodo" poderá receber os seguintes valores:
mapaDoDia: imprime o mapa de atividades de um dia específico
estaSemana: imprime o mapa de atividades nesta semana do auditório selecionado
proximaSemana: imprime o mapa de atividades do auditório selecionado que ocorerão na semana subsequente à impressão
auditório recebe o nome amigável do auditório cujas atividades serão impressas e auditórioId recebe o id do auditório, conforme registrado no banco de dados*/

var mapa = function(periodo, reservas, auditorio, auditorioId) {
    var semana = moment().week(),
        inicioSemana = moment().week(semana).day(1),
        inicioProximaSemana = moment(inicioSemana).add(7, "days"),
        dias;

    if (periodo === "estaSemana") {
        primeiroDia = inicioSemana;
        dias = 5;
    } else if (periodo === "proximaSemana") {
        primeiroDia = inicioProximaSemana;
        dias = 5;
    } else  {
        primeiroDia = periodo;
        dias = 1;
    }

    if (document.getElementById("reservas-semana")) {
        document.getElementById("reservas-semana").innerHTML += `<h2>${auditorio}</h2>`;
    } else if (document.getElementById("reservas-dia")) {
        document.getElementById("reservas-dia").innerHTML += `<h2>${auditorio}</h2>`;
    }

    for (var i = 0; i < dias; i++) {
        var reservasDoDia = [];
        variaveisGlobais.dataSelecionada = moment(primeiroDia).add(i, "days");
        for (let j = 0; j < reservas.length; j++) {
            for (let k = 0; k < reservas[j].horarios.length; k++) {
                if (reservas[j].horarios[k].split("-")[2] === moment(variaveisGlobais.dataSelecionada).format("DD")) {
                    reservasDoDia.push(reservas[j].horarios[k])
                }
            }
        }
        //compondo um novo dia
        var dia = `
        <div id="dia-${auditorioId}-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}" class="dia-main-div">
            <div class="dia-header dia-${auditorioId}-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}">
                <h2></h2>
                <span></span>
            </div>
            <div id="horarios-${auditorioId}-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}" class="horarios"></div>
        </div>`;
        if (document.getElementById("reservas-semana")) {
            document.getElementById("reservas-semana").insertAdjacentHTML("beforeend", dia);
        } else if (document.getElementById("reservas-dia")) {
            document.getElementById("reservas-dia").insertAdjacentHTML("beforeend", dia);
        }

        horariosDOM(`horarios-${auditorioId}-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}`);
        variaveisGlobais.exibirDia(reservas, auditorioId);
    }
};

//eliminar do DOM os horários ociosos
var horariosOcupados = function() {
    var horariosContainer = document.querySelectorAll(".horarios");
    for(i= 0; i < horariosContainer.length; i++) {
        var horarios = document.querySelectorAll(`#${horariosContainer[i].id} .horario`);
        var temReserva = false;
        for(j = 0; j < horarios.length; j++) {
            if (horarios[j].classList.contains("agendado") || horarios[j].classList.contains("requisitado")) {
                temReserva = true;
            }
        }
        if(!temReserva && !horariosContainer[i].classList.contains("feriado")) {
            horariosContainer[i].innerHTML = "Não há reservas nesta data";
            horariosContainer[i].classList.add("livre");
        } else if (!temReserva && horariosContainer[i].classList.contains("feriado")) {
            horariosContainer[i].innerHTML = "Feriado";
            horariosContainer[i].classList.add("livre");
        }
    }
};

//bloco de execuções e listeners
document.addEventListener("DOMContentLoaded", async function() {
    document.querySelector(`.agenda-desktop`).outerHTML = "";
    var auditorios = await recuperarAuditorios();
    var auditorio;
    var reservas = await recuperarReservas();
    var reservasFiltradas;

    if (document.getElementById("escolher-semana")) {
        auditoriosDOM(auditorios);
        var audId;
        document.querySelector(".auditorios-wrapper").addEventListener("click", async function(e) {
            if (e.target.classList.contains("auditorio")) {
                audId = e.target.id;
                auditorio = document.querySelector(`#${e.target.id} .nome`).innerHTML;
                //selecionar as reservas específicas do auditório clicado
                reservasFiltradas = filtrarReservas(e.target.id, reservas);
                document.getElementById(`overlay`).classList.add("branco-translucido");
                document.getElementsByTagName(`body`)[0].classList.add("fixed");
                variaveisGlobais.controlarVisibilidade("exibir", "#overlay");
                variaveisGlobais.controlarVisibilidade("exibir", "#escolher-semana");
            }
        });

        document.getElementById("escolher-semana").addEventListener("click", function(e) {
            if (e.target.classList.contains("opcao-semana") && e.target.classList.contains("esta-semana")) {
                periodo = "estaSemana";
            } else if (e.target.classList.contains("opcao-semana")) {
                periodo = "proximaSemana";
            }
            if (!e.target.classList.contains("fa-times")) {
                //limpar o container do mapa
                document.getElementById("reservas-semana").innerHTML = "";
                //inserir o cabeçalho
                document.getElementById("reservas-semana").innerHTML = header;
                document.getElementById("mapa-header").insertAdjacentHTML("beforeend", `<p>Atividades na semana</p>`);
                //gerar o mapa
                mapa(periodo, reservasFiltradas, auditorio, audId);
                //eliminar do DOM os horários ociosos
                horariosOcupados();
                //imprimindo mensagem especificas
                if (audId === "quinhentao") {
                    var info = `
                        <p class="info">Obs: O Hall do Quinhentão, quando não solicitado, será utilizado nos dias e horários abaixo:</p>
                        <p class="info">Aula de Samba: 2ª e 4ª feiras de 17 às 18h | Aula de Bolero: 3ª e 5ª de 12 às 13h | Aula de Forró: 3ª e 5ª  de 17 às 18h</p>
                    `;
                    document.getElementById("reservas-semana").insertAdjacentHTML("beforeend", info);
                }
                //imprimir a tela
                setTimeout(function(){
                    window.print();
                }, 30);
            }
            variaveisGlobais.controlarVisibilidade("ocultar", "#overlay");
            document.getElementsByTagName(`body`)[0].classList.remove("fixed");
            variaveisGlobais.controlarVisibilidade("ocultar", "#escolher-semana");
        });
    } else if (document.getElementById("reservas-dia")) {

        var aud = [], audId = [];
        //carregando a lista de auditorios
        for (let i = 0; i < auditorios.length; i++) {
            aud.push(auditorios[i].nome);
            audId.push(auditorios[i]._id)
        }

        //iniciando o datepicker
        $("#datepickerMapaDia").datepicker({
            minDate: variaveisGlobais.antecedenciaMinima,
            maxDate: variaveisGlobais.antecedenciaMaxima,
            beforeShowDay: $.datepicker.noWeekends,
            dateFormat: "yy-mm-dd"
        }).on("input change", function(e) {
            document.getElementById("reservas-dia").innerHTML = "";
            for (let i = 0; i < aud.length; i++) {
                reservasFiltradas = filtrarReservas(audId[i], reservas);
                //gerar o mapa
                mapa(e.target.value, reservasFiltradas, aud[i], audId[i]);
                //eliminar do DOM os horários ociosos
                horariosOcupados();
            }

            //inserindo o dia no cabeçalho do relatórios
        document.getElementById("reservas-dia").insertAdjacentHTML("afterbegin", `${header}<h2>Atividades do dia ${moment(variaveisGlobais.dataSelecionada).format("DD [de] MMMM [de] YYYY")}</h2>`);
            //document.getElementById("reservas-dia").insertAdjacentHTML("afterbegin", header);
            document.getElementById("mapa-header").insertAdjacentHTML("beforeend", `<p>Atividades nos espaços da Decania do CCS</p>`);
            //imprimir a tela
            setTimeout(function(){
                window.print();
            }, 10);
        });
    }
});
