///////////////////////////////////////////////
////////////// VARIÁVEIS GLOBAIS //////////////
///////////////////////////////////////////////
var horarios = [],
    antMax = variaveisGlobais.antecedenciaMaxima,
    antMaxNum = variaveisGlobais.antecedenciaMaximaNumber,
    antMin = variaveisGlobais.antecedenciaMinima,
    carrinho = document.getElementById("carrinho-horarios"),
    botaoCarrinho = document.getElementById("botao-carrinho"),
    inputsObrigatorios = document.querySelectorAll("input[required], select[required], textarea[required]"),
    publico = document.getElementById(`publico`),
    eventos = [
        "colação de grau", //0
        "evento comemorativo de Unidade", //1
        "evento comemorativo", //2
        "cerimônia de posse", //3
        "aula inaugural", //4
        "recepção de calouros", //5
        "semana acadêmica", //6
        "workshop", //7
        "simpósio", //8
        "palestra/conferência", //9
        "reunião do Conselho de Centro", //10
        "congregação de Unidades", //11
        "defesa de dissertação/tese", //12
        "defesa de TCC", //13
        "seminário", //14
        "reuniões diversas", //15
        "formatura", //16
        "debates sobre consulta eleitoral - Unidades", //17
        "forum", //18
        "semana de treinamentos", //19
        "mesa redonda", //20
        "VI Semana da Fórmula", //21
        "eventos variados", //22
        "reunião", //23

    ],
    auditorios = {
        quinhentao: [eventos[0], eventos[1], eventos[3], eventos[4], eventos[5], eventos[6], eventos[7], eventos[8], eventos[9]],
        helioFraga: [eventos[10], eventos[11], eventos[12], eventos[9], eventos[8], eventos[2], eventos[14], eventos[23], eventos[4], eventos[5], eventos[16], "reunião de Extensão", "Liga Acadêmica", "diálogo de conclusão", "apresentação de vídeo"],
        audN: [eventos[6], eventos[7], eventos[14], eventos[2], eventos[22], eventos[8], eventos[9], eventos[0], eventos[12], eventos[10], eventos[4], eventos[3], eventos[23], eventos[17], "jornada", "fórum", "semana de treinamentos", "mesa redonda", "Semana da Fórmula"],
        bezao: [eventos[5], "provas - graduação e pós-graduação", "prova - processos seletivos", "assembleia", "encontro estudantil"],
        n106: [eventos[9], eventos[23], "vídeo-conferência"],
        n202: [eventos[12], eventos[22], eventos[23], eventos[13], eventos[7], eventos[4], eventos[14], "ciclos de debates e debates variados", "prova", "Cine Debate", "Biossemana", "Jornada de Pós-Graduação"],
        bib: [eventos[0]]

    };
///////////////////////////////////////
////////////// LISTENERS //////////////
///////////////////////////////////////

//eventos de scroll
document.addEventListener("scroll", function(){
    if (document.querySelector(".footer").getBoundingClientRect().top > window.innerHeight) {
        botaoCarrinho.style.bottom = "10px";
        botaoCarrinho.style.top = "unset";

    } else {
        botaoCarrinho.style.top = document.querySelector(".footer").getBoundingClientRect().top - 130 + "px";
        botaoCarrinho.style.bottom = "unset";
    }

});

var validarFormulario = (e) => {
    e.preventDefault(); 
    if (!variaveisGlobais.disabled && Number(publico.value) <= Number(publico.max) ) {  
        let camposInvalidos
        camposInvalidos = variaveisGlobais.checarInputs(inputsObrigatorios);  
        if (!camposInvalidos && !variaveisGlobais.disabled && document.getElementById(`emailResponsavel`).value.search("@") >= 0) {
            if (horarios.length === 0) {       
                variaveisGlobais.exibirMensagem(`Adicione ao menos um horário ao seu pedido de reserva.`, 2500);
            } else {
                if (!variaveisGlobais.disabled) {
                    variaveisGlobais.clickingOnce(); 
                    document.getElementById(`formReserva`).submit();
                }
            }
        } else if (!camposInvalidos && document.getElementById(`emailResponsavel`).value.search("@") < 0) {            
            $('html, body').animate({ scrollTop: $(`#emailResponsavel`).offset().top - 120}, 'slow', function () {
                variaveisGlobais.exibirMensagem(`É necessário informar um endereço de e-mail válido.`, 2000);                  
            });            
        }        
    } else if (Number(publico.value) > Number(publico.max)) {
        $('html, body').animate({ scrollTop: $(`#publico`).offset().top - 120}, 'slow', function () {
            variaveisGlobais.exibirMensagem(`O público esperado deve ser menor que a capacidade da sala, ${publico.max} pessoas.`, 2000);                           
        });  
    }  
}

(function calendarioDOM(){

    //selecionando horários na agenda diária
    document.querySelector(".reservas-dia-container").addEventListener("click", function(e){

        //limpando a seleção dos horários
        if (e.target.classList.contains("fa-caret-left") || e.target.classList.contains("fa-caret-right")) {
            //atualizando a agenda
            variaveisGlobais.refreshDiv(horarios);
            variaveisGlobais.exibirDia(variaveisGlobais.reservas);
        }

        if (e.target.classList.contains("horario")) {
            //if (!e.target.classList.contains("requisitado")) {
                //comportamento ao clicar em horário vago, no que tange ao array "horários"
                if (e.target.classList.contains("incluir")) {
                    e.target.classList.remove("incluir");
                    for (let i = horarios.length; i >= 0; i--) {
                        if (moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD[-]") + e.target.id === horarios[i]) {
                            horarios.splice(i, 1);
                        }
                    }
                    document.getElementById("horarios").value = horarios;
                } else {
                    document.getElementById(e.target.id).classList.add("incluir");
                    horarios.push(moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD[-]") + e.target.id);
                    document.getElementById("horarios").value = horarios;
                }
            //}
        }
        if (horarios.length > 0) {
            var carrinho = horariosDOMCarrinho(horarios);
            document.getElementById("carrinho-horarios").innerHTML = "";
            document.getElementById("carrinho-horarios").insertAdjacentHTML("beforeend", carrinho);
        } else {
            document.getElementById("carrinho-horarios").innerHTML = "<h3>Resumo do pedido</h3><i class='fa fa-times fechar-carrinho'></i><div class='carrinho-vazio'><p class='text-shadow-inset'>Adicione ao menos um horário para enviar seu pedido de reserva</p></div>"
        }
    });

    //impedir o envio do formulário sem incluir horários no pedido de reserva
    document.getElementById("btn-submit").addEventListener("click", function(e){
        validarFormulario(e)        
    });

    //aviso se o público esperado informado for superior à capacidade do auditório
    document.getElementById("publico").addEventListener("input", function(e){
        var publicoContainer = document.getElementById("publico-container"),
            capacidadeAud = document.querySelector("span.capacidade-auditorio");
        if (Number(e.target.value) > e.target.max) {
            document.getElementById("publico").focus();
            capacidadeAud.classList.remove("hidden");
            publicoContainer.classList.add("capacidade-auditorio");
        } else if (publicoContainer.classList.contains("capacidade-auditorio")){
            capacidadeAud.classList.add("hidden");
            publicoContainer.classList.remove("capacidade-auditorio");
        }
    });

    // comandos de controle de interface entre o carrinho de horários e a agenda
    document.getElementById("carrinho-horarios").addEventListener("click", function(e){
        if (e.target.classList.contains("eliminar-horario")) {

            //retirando a marcação de seleção na agenda HTML
            if (moment(e.target.previousElementSibling.id.substr(9, 10)).format("YYYY MM DD") === moment(variaveisGlobais.dataSelecionada).format("YYYY MM DD")) {
                document.getElementById(e.target.previousElementSibling.id.substring(20)).classList.remove("incluir");
            }
            //zerando o input com os horários, que servem de base para as operações no servidor
            document.getElementById("horarios").value = "";

            //eliminando o horário selecionado do array de horários
            for (let i = 0; i < horarios.length; i++) {
                if (e.target.previousElementSibling.id.substring(9) === horarios[i]) {
                    horarios.splice(i, 1);
                }
            }

            //atualizando o input de horários com os horários remanescentes após a exclusão de um horário
            document.getElementById("horarios").value = horarios;

            //animação exclusão do item do carrinho:
            e.target.parentElement.classList.add("maior");
            setTimeout(function(){
                e.target.parentElement.classList.add("minimiza");
                e.target.parentElement.classList.add("opacidade-zero");
            }, 300);

            //atualizando o HTML do carrinho
            setTimeout(function(){
                document.getElementById("carrinho-horarios").innerHTML = "";
                if (horarios.length > 0) {
                    var carrinho = horariosDOMCarrinho(horarios);
                    document.getElementById("carrinho-horarios").insertAdjacentHTML("beforeend", carrinho);
                } else {
                    document.getElementById("carrinho-horarios").innerHTML = "<h3>Resumo do pedido</h3><i class='fa fa-times fechar-carrinho'></i><div class='carrinho-vazio'><p class='text-shadow-inset'>Adicione ao menos um horário para enviar seu pedido de reserva</p></div>";
                }
            }, 800);

        }
        if (e.target.classList.contains("fechar-carrinho")) {
            carrinho.classList.remove("aberto");
        }
    }, true);

    //exibindo ou ocultando o resumo do pedido:
    botaoCarrinho.addEventListener("click", function(){
        carrinho.classList.toggle("aberto");
    });
})();

/////////////////////////////////////
////////////// FUNCOES //////////////
/////////////////////////////////////

//inserir a estrutura dos horários agenda no DOM
var horariosDOM = function() {
    var estruturaAgenda = `<div id="dia-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}" class="dia-header dia-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}"><i class="fa fa-caret-left"></i><h2></h2><i class="fa fa-caret-right"></i><span></span></div><div id="horarios-${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")}" class="horarios"><h2>Feriado</h2></div>`,
        html = "";

    document.querySelector(".reservas-dia-container").insertAdjacentHTML("beforeend", estruturaAgenda);
    for (let i = 0; i < variaveisGlobais.intervalos.length; i++) {
        //marcando os horários nos quais a sala n202 não pode ser reservada
        if(document.querySelector("main").id === "n202" && i > 2) {
            var discGrad = "disc-grad";
        } else {
            var discGrad = "";
        }
        html += '<div class="horario livre ' + discGrad + '" id="' + ("0" + variaveisGlobais.intervalos[i]).slice(-2) +'"><span>' + ("0" + variaveisGlobais.intervalos[i]).slice(-2) + 'h - ' + variaveisGlobais.horaFim(variaveisGlobais.intervalos[i]) + 'h</span><p class="nomeEvento"></p></div>';
    }
    document.querySelector(".horarios").insertAdjacentHTML("beforeend", html);
};


//gerar os dados do "carrinho de reservas"
var horariosDOMCarrinho = function(horarios){
    var reserva;
    horarios.sort();
    var hora = horarios[0].substring(11,13);
    reserva = '<div class = reserva> <h3>Resumo do pedido</h3><i class="fa fa-times fechar-carrinho"></i><p class="dia"><strong>' + moment(horarios[0].substring(0,10)).format("DD") + ' de ' + moment(horarios[0].substring(0,10)).format("MMMM") + '</strong></p>';
    reserva += '<div><span class="horario-carrinho" id="carrinho-' + horarios[0].substring(0,13) + '">' + hora + ':00 - ' + variaveisGlobais.horaFim(Number(hora)) + ':00</span><i class="fa fa-times eliminar-horario"></i></div>';
    for (let i = 1; i < horarios.length; i++) {
        var horaI = horarios[i].substring(11,13);
        if (horarios[i].substring(0,10) === horarios[i-1].substring(0,10)) {
            reserva += '<div><span class="horario-carrinho" id="carrinho-' + horarios[i].substring(0,13) + '">' + horaI + ':00 - ' + variaveisGlobais.horaFim(Number(horaI)) + ':00</span><i class="fa fa-times eliminar-horario"></i></div>';
        } else {
            reserva += "</div>";
            reserva += '<div class = reserva><p class="dia"><strong>' + moment(horarios[i].substring(0,10)).format("DD") +' de ' + moment(horarios[i].substring(0,10)).format("MMMM") + '</strong></p>';
            reserva += '<div><span class="horario-carrinho" id="carrinho-' + horarios[i].substring(0,13) + '">' + horaI + ':00 - ' + variaveisGlobais.horaFim(Number(horaI)) + ':00</span><i class="fa fa-times eliminar-horario"></i></div>';
        }
    }
    reserva += "</div>";
    reserva += '<div class="carrinho-submit"><span class="dica">Certifique-se de ter preenchido todos campos do formulário e clique no botão abaixo para submeter seu pedido</span><button type="submit" form="formReserva" id="btn-carrinho-submit">Enviar</button></div>';
    return reserva;
};

//controlando a exibição das setas da agenda de dias
var controlarSetas = function() {
    if (moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(antMin, "days").format("DD-MM-YYYY")) {
    document.querySelector(".fa-caret-left").classList.add("inactive");
    } else {
        document.querySelector(".fa-caret-left").classList.remove("inactive");
    }

    if (moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(antMaxNum, "months").format("DD-MM-YYYY")) {
        document.querySelector(".fa-caret-right").classList.add("inactive");
    } else if (moment(new Date()).add(antMaxNum, "months").day() === 6 && moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(antMaxNum, "months").subtract(1, "days").format("DD-MM-YYYY")  ) {
        //antMaxNum = "+6m -1d";
        document.querySelector(".fa-caret-right").classList.add("inactive");
    } else if (moment(new Date()).add(antMaxNum, "months").day() === 0 && moment(variaveisGlobais.dataSelecionada).format("DD-MM-YYYY") === moment(new Date()).add(antMaxNum, "months").subtract(2, "days").format("DD-MM-YYYY") ) {
        //antMaxNum = "+6m -2d" ;
        document.querySelector(".fa-caret-right").classList.add("inactive");
    } else {
        document.querySelector(".fa-caret-right").classList.remove("inactive");
    }
}

//populando as opções de natureza do evento, em função do auditório selecionado
var naturezaEvento = function() {
    var aud = document.querySelector("main").id;
    var naturezas = auditorios[aud].sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    });
    for (let i = 0; i < auditorios[aud].length; i++) {
        document.getElementById("naturezaEvento").insertAdjacentHTML("beforeend", `<option value="${naturezas[i]}">${naturezas[i]}</option>`)
    }

};

////////////////////////////////////////////////
////////////// BLOCO DE EXECUÇÕES //////////////
////////////////////////////////////////////////

window.addEventListener("DOMContentLoaded", async function(e){
    //populando as opções de eventos permitidos em cada auditório
    naturezaEvento();

    //inserir a estrutura dos horários na agenda do DOM:
    horariosDOM();

    //recuperar reservas
    variaveisGlobais.reservas = await variaveisGlobais.ajax("/recuperarReservas", "get", {auditorio: document.querySelector(".reserva").id});
    
    //checar atividades no intervalo
    var diasComEvento = variaveisGlobais.checarAtividades(variaveisGlobais.reservas);

    //inicializar datepicker
    variaveisGlobais.datepicker(diasComEvento, true, horarios);

    //exibir a agenda do dia selecionado
    variaveisGlobais.exibirDia(variaveisGlobais.reservas);

    //inicializar o controle do datepicker pela agenda de dias
    variaveisGlobais.controleDatepicker();

    //envio de pedidos via carrihno de reservas
    document.getElementById("carrinho-horarios").addEventListener("click", function(e){
        validarFormulario(e);
    });
});
