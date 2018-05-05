
//////////////////////
//////// VARIÁVEIS GLOBAIS PUSH TESTE
//////////////////////

var variaveisGlobais = (function(){
    var selectedN1,
        selectedN1Old,
        selectedN2,
        selectedN2Old,
        selectedN3,
        selectedN3Old,
        reservas,
        dataSelecionada,
        antecedenciaMinima = 2,
        antecedenciaMaximaNumber = 8,
        antecedenciaMaximaSub, // valor a subtrair de antecedenciaMaximaNumber, quando o último dia é sábado ou domingo
        antecedenciaMaxima = `+${antecedenciaMaximaNumber}m`,
        intervalos = [8, 10, 12, 13, 15, 17, 18],
        feriados,
        videos, fotos,
        contatos, conteudos,
        mensagensGenericas,
        disabled = false;

        //feriados do ano corrente:
        feriados = [new Date(2017, 8, 7), new Date(2017, 9, 12), new Date(2017, 10, 2), new Date(2017, 10, 15), new Date(2017, 10, 20), new Date(2017, 11, 25)];

    //definindo a data exibida logo que o site é carregado
    if (new Date().getDay() === 6) {
        dataSelecionada = moment(new Date()).add(2, "days");
    } else if (new Date().getDay() === 0) {
        dataSelecionada = moment(new Date()).add(1, "days");
    } else {
        dataSelecionada = moment(new Date());
    }

    //definindo os valores de antecedência mínima e máxima para o módulo de reserva
    if (document.getElementById("formReserva")) {
        if (new Date().getDay() === 5) {
            antecedenciaMinima += 2;
        } else if (new Date().getDay() === 6){
            antecedenciaMinima += 1;
        } else if (moment(new Date()).add(antecedenciaMinima, "days").day() === 6) {
            antecedenciaMinima = moment(new Date()).add(antecedenciaMinima, "days").diff(moment(new Date()), "days") + 2;
        } else if (moment(new Date()).add(antecedenciaMinima, "days").day() === 0) {
            antecedenciaMinima = moment(new Date()).add(antecedenciaMinima, "days").diff(moment(new Date()), "days") + 1;
        }
        dataSelecionada = moment(new Date()).add(antecedenciaMinima, "days");
    } else {
        antecedenciaMinima = -30;
    }

    //reefinindo antecedência máxima para sábados e domingos
    if (moment(new Date()).add(antecedenciaMaximaNumber, "months").day() === 6) {
        antecedenciaMaxima = `${antecedenciaMaxima} -1d`;
        antecedenciaMaximaSub = 1;
    } else if (moment(new Date()).add(antecedenciaMaximaNumber, "months").day() === 0) {
        antecedenciaMaxima = `${antecedenciaMaxima} -2d`;
        antecedenciaMaximaSub = 2;
    }

    //detectando, primariamente, se a aplicação é exibida em resolução > 1024px
    var desktopDef;
    desktopDef = window.innerWidth >= 1024 ? true : false;
    
    var mobileDef;
    mobileDef = window.innerWidth <= 500 ? true : false;

    //definindo o DIV de mensagens genéricas.
    mensagensGenericas = document.getElementById("mensagens-genericas");

    ////////////////////////////
    //////// funções globais
    ////////////////////////////

    //alternar os ícones carte-up e caret-down
    var trocarSeta = function(elemento) {
        elemento.classList.toggle("fa-caret-up");
        elemento.classList.toggle("fa-caret-down");
    };

    //argumentos - acao: ocultar ou exibir. idElemento: ID do elemento do DOM:-
    var controlarVisibilidade = function(acao, seletor) {
        if (acao === "exibir") {
            document.querySelector(seletor).classList.remove("hidden");
            setTimeout(function(){
                document.querySelector(seletor).classList.remove("opacidade-zero");
            }, 50);
        } else {
            document.querySelector(seletor).classList.add("opacidade-zero");
            setTimeout(function(){
                document.querySelector(seletor).classList.add("hidden");
            }, 500);
        }
    };

    //mensagem - mensagem a ser exibida | t - tempo de exibição |header - mensagem a ser exibida no header.
    var exibirMensagem = function(mensagem,  t, header) {
        let cabecalho;
        mensagemDIV = variaveisGlobais.mensagensGenericas;
        header ? cabecalho = header : cabecalho = "Atenção!";
        mensagemDIV.innerHTML = `
        <h2 class="header">${cabecalho}</h2>
        ${mensagem}
        `;
        controlarVisibilidade("exibir", `#${mensagemDIV.id}`);
        if (t) {
            setTimeout(function() {
                controlarVisibilidade("ocultar", `#${mensagemDIV.id}`)
            }, t);
        }
    };

    ///Controlando a exibição no datepicker pela agenda diária
    var controleDatepicker =  function(){
        document.querySelector(".dia-header").addEventListener("click", function(e){

            if (e.target.classList.contains("fa-caret-right")) {
                if (moment(variaveisGlobais.dataSelecionada).day() === 5) {
                    $("#datepickerDiaEvento").datepicker("setDate", moment(variaveisGlobais.dataSelecionada).add(3, "days").format("DD/MM/YYYY"));
                    variaveisGlobais.dataSelecionada = moment(variaveisGlobais.dataSelecionada).add(3, "days");
                    exibirDiaConsulta(variaveisGlobais.reservas);
                } else {
                    $("#datepickerDiaEvento").datepicker("setDate", moment(variaveisGlobais.dataSelecionada).add(1, "days").format("DD/MM/YYYY"));
                    variaveisGlobais.dataSelecionada = moment(variaveisGlobais.dataSelecionada).add(1, "days");
                    exibirDiaConsulta(variaveisGlobais.reservas);
                }
            } else if (e.target.classList.contains("fa-caret-left")) {
                if (moment(variaveisGlobais.dataSelecionada).day() === 1) {
                    $("#datepickerDiaEvento").datepicker("setDate", moment(variaveisGlobais.dataSelecionada).subtract(3, "days").format("DD/MM/YYYY"));
                    variaveisGlobais.dataSelecionada = moment(variaveisGlobais.dataSelecionada).subtract(3, "days");
                    exibirDiaConsulta(variaveisGlobais.reservas);
                } else {
                    $("#datepickerDiaEvento").datepicker("setDate", moment(variaveisGlobais.dataSelecionada).subtract(1, "days").format("DD/MM/YYYY"));
                    variaveisGlobais.dataSelecionada = moment(variaveisGlobais.dataSelecionada).subtract(1, "days");
                    exibirDiaConsulta(variaveisGlobais.reservas);
                }
            }
        });
    };

    //Verificar os dias em que há atividades no intervalo para exibir no datepicker
    var checarAtividades = function (reservas) {
        var todasReservas = [];
        var diasComEvento = [];   //array com os dias em que há atividade
        var dataInicio = variaveisGlobais.antecedenciaMinima;
        var encontrou = false;
        var numDias = moment(new Date()).add(variaveisGlobais.antecedenciaMaximaNumber, "months").subtract(variaveisGlobais.antecedenciaMaximaSub, "days").diff(moment(new Date()).add(variaveisGlobais.antecedenciaMinima, "days"), "days");

        //agrupando todos os horários de todas as reservas
        for (let i = 0; i < reservas.length; i++) {
            for (let j = 0; j < reservas[i].horarios.length; j++) {
                todasReservas.push(reservas[i].horarios[j])
            }
        }

        //confrontando os horários e os dias
        for (let i = 0; i <= numDias; i++) {
            let temAtividade;
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

    //configurando e exibindo o datepicker
    var datepicker = function(diasComEvento, eReserva, horarios = null) {
        //inicializar o datepicker
        $("#datepickerDiaEvento").datepicker({
            minDate: variaveisGlobais.antecedenciaMinima,
            maxDate: variaveisGlobais.antecedenciaMaxima,
            beforeShowDay: function(data) {
                if (moment(data).day() !== 6 && moment(data).day() !== 0 && data <= moment(new Date()).add(variaveisGlobais.antecedenciaMaximaNumber, "months") && data >= moment(new Date()).add(variaveisGlobais.antecedenciaMinima, "days") ) {
                    var ocupado = false;
                    var feriado = false;
                    for (let i = 0; i < diasComEvento.length; i++) {
                        if (moment(diasComEvento[i]).format("YYYY-MM-DD") === moment(data).format("YYYY-MM-DD")) {
                            ocupado = true;
                            break;
                        }
                    }
                    for (let i = 0; i < variaveisGlobais.feriados.length; i++) {
                        if (moment(variaveisGlobais.feriados[i]).format("YYYY-MM-DD") === moment(data).format("YYYY-MM-DD")) {
                            feriado = true;
                            break;
                        }
                    }
                }
                if (moment(data).day() === 6 || moment(data).day() === 0) {
                    return [false, ""];
                } else if (ocupado) {
                    return [true, "agendado", "Há eventos neste dia"];
                } else if (feriado) {
                    return [true, "feriado", "feriado"];
                } else {
                    return [true, "livre", "nenhum evento"];
                }
            }
        }).on("input change", function(e) {
            variaveisGlobais.dataSelecionada = moment(e.target.value.split("/")[2] + "-" + e.target.value.split("/")[1] + "-" + e.target.value.split("/")[0]).toISOString();
            if(eReserva){
                refreshDiv(horarios);
                exibirDia(variaveisGlobais.reservas);
            } else{
                document.getElementById("horarios").classList.remove("feriado");
                exibirDiaConsulta(variaveisGlobais.reservas);
            }
        });
    };

    //exibir a agenda do dia selecionado, gerando o DOM com base nas reservas e pedidos
    var exibirDia = function (reservas, auditorioId) {
        if (auditorioId) {
            auditorioId +=`-`;
        } else {
            auditorioId = "";
        }
        var dataPorExtenso = moment(variaveisGlobais.dataSelecionada).format("DD [de] MMMM");
        var diaSemana = moment(variaveisGlobais.dataSelecionada).format("dddd");

        //atauzliando o cabeçalho do div de horários para o dia em questão
        diaContainer(moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD"), auditorioId);

        //renderizando o dia selecionado
        if (!document.getElementById("reservas-dia")) {
            document.querySelector(`.dia-${auditorioId}${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")} h2`).innerHTML = dataPorExtenso;
            document.querySelector(`.dia-${auditorioId}${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")} span`).innerHTML = diaSemana;
        }

        //controlando a exibição das setas da agenda de dias
        controlarSetas();

        //verificando se o dia é feriado
        for (let i = 0; i < variaveisGlobais.feriados.length; i++) {
            if (moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD") === moment(variaveisGlobais.feriados[i]).format("YYYY-MM-DD") && !document.querySelector(".reservas-dia-container")) {
                document.querySelector(`#dia-${auditorioId}${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")} .horarios`).classList.add("feriado");
            } else if (document.querySelector(".reservas-dia-container") && moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD") === moment(variaveisGlobais.feriados[i]).format("YYYY-MM-DD")) {
                document.querySelector(".horarios").classList.add("feriado");
            }
        }
        for (let i = 0; i < reservas.length; i++) {
            var evento = [], horarioRequisitado = '';
            if (reservas[i].status === 'requisitado') {horarioRequisitado = '*Horário Requisitado'} 
            for (let j = 0; j < reservas[i].horarios.length; j++) {
                if (document.getElementById("reservas-semana") || document.getElementById("reservas-dia")) {
                    //duplo escape octal maiores informações aqui:
                    //https://stackoverflow.com/questions/20306204/using-queryselector-with-ids-that-are-numbers
                    //e aqui:
                    //https://stackoverflow.com/questions/36878850/octal-literals-are-not-allowed-in-strict-mode
                    var horario = document.querySelector(`#horarios-${auditorioId}${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")} #\\3${reservas[i].horarios[j].substr(11,1)} ${reservas[i].horarios[j].substr(12,1)}`);

                } else {
                    var horario = document.getElementById(reservas[i].horarios[j].substr(11,2));
                }

                if ((reservas[i].horarios[j].substr(0,10)) === moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")) {
                    if(reservas[i].observacoes === undefined) {
                        reservas[i].observacoes = "";
                    }
                    evento.push(reservas[i].horarios[j]);
                    horario.classList.remove("livre");
                    horario.classList.add(reservas[i].status);
                    horario.lastElementChild.innerHTML = `<span class='horario--nome-evento'><strong>${reservas[i].evento}</strong></span> <span class='horario--nome-responsavel'> <strong>Responsável:</strong> ${reservas[i].nomeResponsavel}</span><span><strong class='horario--observacoes'>Observações:</strong> ${reservas[i].observacoes}</span><span class='horario--obs-requisitado'>${horarioRequisitado}</span>`;
                }
            }
            for (let k = 0; k < evento.length; k++) {
                var n, continuacao = false, ultimoContinuacao;
                if(Number(evento[k].substr(11,2)) == variaveisGlobais.intervalos[3] || Number(evento[k].substr(11,2) == variaveisGlobais.intervalos[6])){
                    n = 1;
                } else{
                    n = 2;
                }
                if (document.getElementById("reservas-semana") || document.getElementById("reservas-dia")) {
                    var eventoId = document.querySelector(`#horarios-${auditorioId}${moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")} #\\3${evento[k].substr(11,1)} ${evento[k].substr(12,1)}`);
                } else {
                    var eventoId = document.getElementById(evento[k].substr(11,2));
                }
                if ( k === 0 || evento[k-1] && (Number(evento[k-1].substr(11,2)) + n) !== (Number(evento[k].substr(11,2)))) {
                    eventoId.classList.add("primeiro");
                } else if (evento[k-1] && (Number(evento[k-1].substr(11,2)) + n) === (Number(evento[k].substr(11,2)))) {
                    eventoId.classList.add("continuacao");
                    continuacao = true;
                    ultimoContinuacao = eventoId;
                }
                if (ultimoContinuacao && ((k > 0 && !continuacao) || (k === evento.length - 1 && eventoId.classList.contains("continuacao")))) {
                    ultimoContinuacao.classList.add("ultimo");
                    ultimoContinuacao.classList.remove("continuacao");
                }
            }
        }
    };

    //exibir a agenda do dia selecionado, gernado o DOM com base nas reservas e pedidos
    var exibirDiaConsulta = function (reservas) {
        var dataPorExtenso = moment(variaveisGlobais.dataSelecionada).format("DD [de] MMMM");
        var diaSemana = moment(variaveisGlobais.dataSelecionada).format("dddd");

        //atauzliando o cabeçalho do div de horários para o dia em questão
        diaContainer(moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD"));

        //limpando as reservas
        for (let i = 0; i < document.querySelectorAll(".horario .reservas-auditorios").length; i++) {
            document.querySelectorAll(".horario .reservas-auditorios")[i].innerHTML = "";
        }

        //limpando feriados
        document.getElementById("horarios").classList.remove("feriado");

        //controlando a exibição das setas da agenda de dias
        controlarSetas();

        //renderizando o dia selecinado
        document.querySelector(".dia-header h2").innerHTML = dataPorExtenso;
        document.querySelector(".dia-header span").innerHTML = diaSemana;
        for (let i = 0; i < reservas.length; i++) {
            for (let j = 0; j < reservas[i].horarios.length; j++) {
                if ((reservas[i].horarios[j].substr(0,10)) === moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD")) {
                    document.getElementById(reservas[i].horarios[j].substr(11,2)).firstElementChild.nextElementSibling.insertAdjacentHTML("beforeend", '<div class="' + reservas[i]._id + ' aud ' + reservas[i].auditorio + ' ' + reservas[i].status + '"><p class="hidden" id="' + reservas[i].auditorio + reservas[i].horarios[j].substr(11,2) + '"><strong>Evento: </strong>' + reservas[i].evento + '<br><strong>Auditório:</strong>' + reservas[i].auditorioNome + '<i class="fa fa-times"></i></p></div>');
                }
            }
        }


        //verificando se o dia é feriado
        for (let i = 0; i < variaveisGlobais.feriados.length; i++) {
            if (moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD") === moment(variaveisGlobais.feriados[i]).format("YYYY-MM-DD")) {
                document.getElementById("horarios").classList.add("feriado");
            }
        }
    };

    //atualizar o container dos horários
    var refreshDiv = async function(horarios){
        //limpando todo o div
        for (let i = 0; i < document.querySelectorAll(`.horario`).length; i++ ) {
            var horario = document.querySelectorAll(`.horario`)[i];
            horario.classList.remove("incluir");
            document.querySelectorAll(`.nomeEvento`)[i].innerHTML = "";
            document.querySelector(`.horarios`).classList.remove("feriado")
            horario.classList.remove("agendado");
            //horario.classList.remove("requisitado");
            horario.classList.remove("primeiro");
            horario.classList.remove("continuacao");
            horario.classList.remove("ultimo");

            horario.classList.add("livre");
        }

        //re-adicionando os horarios já selecionados
        for (let i = 0; i < document.querySelectorAll(`.horario`).length; i++ ) {
            for (let j = 0; j < horarios.length; j++) {
                if (horarios[j] === moment(variaveisGlobais.dataSelecionada).format("YYYY-MM-DD[-]") + document.querySelectorAll(`.horario`)[i].id ) {
                    document.querySelectorAll(`.horario`)[i].classList.add("incluir");
                }
            }
        }
    };

    //especifica a hora final de um certo horário, a partir de sua hora inicial
    var horaFim = function(horaInicio) {
        if(horaInicio === 12 || horaInicio === 17){
            return ("0" + (horaInicio + 1)).slice(-2);
        } else {
            return ("0" + (horaInicio + 2)).slice(-2);
        }
    };

    //função para atualizar a classe que determina o container de horários em um determinado dia:
    var diaContainer = function(data, auditorioId) {
        if (auditorioId) {
            auditorioId += "-";
        } else {
            auditorioId = "";
        }
        if(document.getElementById("reservas-semana") || document.getElementById("reservas-dia")) {
            $(`.dia-${auditorioId}${data}`).attr('class', `dia-header dia-${data}`);
            $(`.dia-${auditorioId}${data}`).attr('id', `dia-${auditorioId}${data}`);
        } else {
            $(`.dia-header`).attr('class', `dia-header dia-${data}`);
            $(`.dia-header`).attr('id', `dia-${data}`);
        }
    };

    //funções para substituir os divs de vídeos do youtube por thumbnails
    var labnolThumb = function (id) {
        var thumb = '<img src="https://i.ytimg.com/vi/ID/hqdefault.jpg">',
            play = '<div class="play"></div>';
        return thumb.replace("ID", id) + play;
    };    
    
    //substituindo os thumbnails por iframes:
    var labnolIframe = function () {
        let iframe = document.createElement("iframe");
        let embed = "https://www.youtube.com/embed/ID?autoplay=1";
        iframe.setAttribute("src", embed.replace("ID", this.dataset.id));
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allowfullscreen", "1");
        this.parentNode.replaceChild(iframe, this);
    };
    
    // REMOVENDO OS PRELOADERS
    function removePreLoaders(classe) {
        for (let i = document.querySelectorAll(".loading" + classe).length - 1; i >= 0; i--) {
            document.querySelectorAll(".loading" + classe)[i].outerHTML = "";
        }
    }

    //gerar o mapa do site dinamicamente
    var mapaDOM = function () {
        document.getElementsByTagName("body")[0].classList.add("fixo");
        document.querySelector(".fechar-mapa").classList.remove("hidden");
        scrollTo('.barraBrasil-e-topbar', 2, () => {
            controlarVisibilidade("exibir", "#mapa-container");
            controlarVisibilidade("exibir", "#fechar-mapa");
        });        
    };

    //função para impedir múltiplos cliques
    var clickingOnce = function() {
        variaveisGlobais.disabled = true;
        setTimeout(function(){
            variaveisGlobais.disabled = false;
        }, 30000);
    }
    
    //Validar formulário. Input são os inputs, selects e textareas que devem ser preenchidos (apresentar valor diferente de "")
    let checarInputs = (inputs) => {
        let encontrouErro = false;
        //função específica para varrer radiobuttons (ou checkboxes, se necessário!) ()
        let checarRadio = (name) => {
            let erro = true
            let radios = document.querySelectorAll(`input[name='${name}']`);
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    erro =  false;
                    break;
                }              
            }
            return erro;
        }
        //exibir dica de tela para inputs não-preenchidos:
        let avisoCampoInvalido = () => {
            variaveisGlobais.controlarVisibilidade("exibir", "#aviso-campo-invalido");
            setTimeout(function(){
                variaveisGlobais.controlarVisibilidade("ocultar", "#aviso-campo-invalido");
            },2500);    
        };  
        
        for (let i=0; i < inputs.length; i++){             
            if (inputs[i].type === 'radio') {
                encontrouErro = checarRadio(inputs[i].name);
                if (encontrouErro) { 
                    scrollTo(inputs[i].parentElement, -120, avisoCampoInvalido);                    
                    break;                    
                } 
            } 
            if (inputs[i].required && inputs[i].value === "") {
                if(!encontrouErro){
                    if(inputs[i].classList.contains('anexo')) {   
                        scrollTo(inputs[i].parentElement, -120, avisoCampoInvalido);                           
                    } else {
                        scrollTo(inputs[i], -120, avisoCampoInvalido);   
                    }
                    encontrouErro = true;
                    break;                    
                }
            }  
        }
        return encontrouErro;
    };
    
    let scrollTo = (selector, offset, callback) => {
        $('html, body').animate({ scrollTop: $(selector).offset().top + offset}, 'slow', function () {
            if (callback) {
                callback();     
            }
        });
    };
    //requisição AJAX universal 
    //Parâmetros: url - a URL da rota que irá tratar a requisição | verb: GET or POST | data: um objeto a ser tratado pelo server na rota destino | callback e callbackError (optional): funções a serem executadas depois do retorno da requisição. 
    //Por padrão, a função requisicao_ajax retorna a resposta do servidor (msg), 
    //Dependencies: JQuery
var ajax = async (paramUrl, verb, data, callback, callbackError) => {
    let response;    
    await $.ajax({type: verb,
        url: paramUrl,
        data: data,
        dataType: "json"
    }).done( function( msg ) {
        response = msg;   
        if (callback) {
            callback(msg);
        }     
    }).fail(function(msg){
        response = msg; 
        if (callbackError) {
            callbackError(msg);
        }
    });
    return response;
};
    return {
        //variáveis
        dataSelecionada,
        reservas,
        selectedN1,
        selectedN1Old,
        selectedN2,
        selectedN2Old,
        selectedN3,
        selectedN3Old,
        antecedenciaMinima,
        antecedenciaMaxima,
        antecedenciaMaximaNumber,
        antecedenciaMaximaSub,
        intervalos,
        desktopDef,
        mobileDef,
        labnolThumb,  
        labnolIframe,      
        videos, fotos,
        feriados,
        mensagensGenericas,
        disabled,
        //funções
        controlarVisibilidade,
        exibirMensagem,
        controleDatepicker,
        checarAtividades,
        checarInputs,
        datepicker,
        exibirDia,
        exibirDiaConsulta,
        refreshDiv,
        horaFim,
        trocarSeta,
        removePreLoaders,
        contatos,
        mapaDOM,
        clickingOnce,
        scrollTo,
        ajax
    }
})();


////////////////////////////////////////////////
//////// FUNCIONALIDADES TOPBAR E MENU
////////////////////////////////////////////////

//fechar menus ao clicar fora do menu em questão ou de seus elementos relacionados. "Elemento opcional" é qualquer elemento e seus descendentes que não seja descendente do menu a ser fechado, mas serve para acioná-lo, ou está vinculado de alguma maneira. classes vinculadas é um array de classes que, caso estejam presentes no elemento clicado, indicam que o menu deve continuar aberto
var fecharMenus = function(e, menu, icone, elementoOpcional, classesVinculadas){
    var menuAberto = false;    
    if(menu) {
        for (let i = 0; i < menu.querySelectorAll("*").length; i++) {
            if (e.target === menu.querySelectorAll("*")[i] || e.target === menu) {
                menuAberto = true;
                break;
            }
        }
    }
    if (elementoOpcional && !menuAberto) {
        for (let i = 0; i < elementoOpcional.querySelectorAll("*").length; i++) {       
            if (e.target === elementoOpcional || elementoOpcional.querySelectorAll("*")[i]  === e.target) {
                menuAberto = true;
                break;
            }
        }
    }    
    if (classesVinculadas && !menuAberto) {
        for (let i = 0; i < classesVinculadas.length; i++) {            
            if (e.target.classList.contains(classesVinculadas[i])) {                
                menuAberto = true;
                break;
            }
        }
    }
    if (!menuAberto) {
        menu.classList.remove("aberto");
        if (icone) {
            icone.classList.remove("fa-caret-up");
            icone.classList.add("fa-caret-down");
        }
    }
};

//rolar a desktopbar para o topo
var desktopBarTopo = function() {    
    variaveisGlobais.scrollTo(".top-bar-desktop", 2);    
};

//detectando, ao redimensionar o browser, se a aplicação é exibida em resolução >= 1024px
var detectarLargura = function() {
    if (window.innerWidth >= 1024) {
        variaveisGlobais.desktopDef = true;
    } else {
        variaveisGlobais.desktopDef = false;
    }
};

var animarTopbar = function() {
    //Animar topbar (mobile layout)
    if (window.pageYOffset > 100 && !document.querySelector(".top-bar").classList.contains("topbar-up")) {
        document.querySelector(".top-bar").classList.add("topbar-up");
    }
    if (window.pageYOffset < 100 && document.querySelector(".top-bar").classList.contains("topbar-up")) {
        document.querySelector(".top-bar").classList.remove("topbar-up");
    }
    if (variaveisGlobais.desktopDef) {
        //Animar topbar e agenda (desktop layout - pagina principal)
        if (document.querySelector(".slideshow") && document.querySelector(".sobre-o-ccs").getBoundingClientRect().top <= 0) {
            document.querySelector(".top-bar-desktop").classList.add("fixed");
            document.getElementById("main-nav").classList.add("fixed");
            document.getElementById("secao-agenda").classList.add("fixed");
            document.getElementById("secao-agenda").style.top = "50px";
        } else if (document.querySelector(".slideshow")) {
            document.querySelector(".top-bar-desktop").classList.remove("fixed");
            document.getElementById("main-nav").classList.remove("fixed");
            document.getElementById("secao-agenda").classList.remove("fixed");
            document.getElementById("secao-agenda").style.top = "0";
        }

        //Animar topbar e agenda (desktop layout - demais páginas)
        if (window.innerWidth >= 1024 && !document.querySelector(".slideshow") /*&& !document.querySelector(".reservar-auditorio")*/) {
            if (document.getElementById("barra-brasil").getBoundingClientRect().top < 0) {
                document.querySelector(".top-bar-desktop").classList.add("fixed");
                document.getElementById("main-nav").classList.add("fixed");
                if (document.getElementById("secao-agenda")) {
                    document.getElementById("secao-agenda").classList.add("fixed");
                    document.getElementById("secao-agenda").style.top = "50px";
                }
            }  else {
                document.querySelector(".top-bar-desktop").classList.remove("fixed");
                document.getElementById("main-nav").classList.remove("fixed");
                if (document.getElementById("secao-agenda")) {
                    document.getElementById("secao-agenda").classList.remove("fixed");
                    document.getElementById("secao-agenda").style.top = "82px";
                }
            }
        }
    }
};

window.addEventListener("scroll", function(){
    detectarLargura();
    animarTopbar();
}, false);

//eventos de clique na página
window.addEventListener("click", function(e){
    var acessoRapidoDesktop = document.querySelector(".acesso-rapido-desktop"),
        acessoRapidoIcone = document.querySelector(".acesso-rapido-desktop i"),
        loginFormDesktop = document.querySelector(".login-form-desktop"),
        loginFormIcone = document.querySelector(".login-seta"),
        agenda = document.getElementById("secao-agenda"),
        filtroResultados = document.querySelector(".filtro-resultados"),
        filtroResultadosIcone = document.querySelector(".icone-refinar-busca");


    if (document.getElementById("carrinho-horarios")) {
        var resumoReserva = document.getElementById("carrinho-horarios");
    }
    if (window.innerWidth >= 1024) {
        //fechando o menu, em resouções >= 1024px, ao se clicar em outros elementos
        if (!e.target.classList.contains("menu") && e.target.id !== "abrir-menu-desktop") {
            var iconeMobile = document.querySelector(".icone-menu-mobile");
            var iconeDesktop = document.getElementById("abrir-menu-desktop");

            document.getElementById("main-nav").classList.remove("action");
            document.querySelector("body").classList.remove("noScroll");
            for (let i = 0; i < document.querySelectorAll(".deslocar").length; i++) {
                document.querySelectorAll(".deslocar")[i].classList.remove("action");
            }
            if (iconeDesktop.classList.contains("fa-times")) {
                iconeDesktop.classList.toggle("fa-times");
                iconeDesktop.classList.toggle("fa-bars");
                iconeMobile.classList.toggle("fa-bars");
                iconeMobile.classList.toggle("fa-times");
                document.getElementById("main-nav-titulo").classList.toggle("hidden");
            }
        }

        //fechando os menus da topbar, quando é aberto o menu principal
        if (e.target.id === "abrir-menu-desktop") {
            var janelasAbertas = document.querySelectorAll(".aberto");
            var icones = document.querySelectorAll(".aberto .fa");

            for (let i = janelasAbertas.length -1; i >= 0 ; i--) {
                janelasAbertas[i].classList.remove("aberto");
                if (icones[i] && (icones[i].classList.contains("fa-caret-down") || icones[i].classList.contains("fa-caret-up"))) {
                    variaveisGlobais.trocarSeta(icones[i]);
                }
            }
            if (!e.target.classList.contains("fechar-carrinho")) {
                e.target.classList.toggle("fa-bars");
                e.target.classList.toggle("fa-times");
            }

            setTimeout(function(){
                document.getElementById("main-nav-titulo").classList.toggle("hidden");
            }, 500);
        }

        //clicar no ícone agenda da top-bar-desktop
        if (!document.querySelector(".reservar-auditorio")) {
            if (document.getElementById("secao-agenda") && e.target.classList.contains("agenda-desktop-clicavel")) {
                document.getElementById("secao-agenda").classList.toggle("aberto");
            }

            if (e.target.classList.contains("agenda-desktop-clicavel") && document.getElementById("secao-agenda").classList.contains("aberto") ) {
                desktopBarTopo();
            }
        } else {
            if (e.target.classList.contains("agenda-desktop-clicavel")) {
                variaveisGlobais.scrollTo('#datepickerDiaEvento', -180);               
            }
        }

        //fechando menus da top-bar-desktop não selecionados
        fecharMenus(e, acessoRapidoDesktop, acessoRapidoIcone);
        fecharMenus(e, loginFormDesktop, loginFormIcone);
        if (agenda) {
            fecharMenus(e, agenda, null, document.querySelector(".agenda-desktop-clicavel"), ["ui-icon", "ui-corner-all", 'ui-state-default']);
        }
        if (resumoReserva) {
            fecharMenus(e, resumoReserva, null, document.getElementById("botao-carrinho"), ["eliminar-horario", "horario", "horario-carrinho"]);
        }
        //fechamento da janela de refinar busca
        if (filtroResultados) {            
            fecharMenus(e, filtroResultados, filtroResultadosIcone, document.querySelector(".refinar-busca-div"));
            setTimeout(function(){
                if (filtroResultados && filtroResultados.classList.contains("aberto")) {
                    for (let i = 0; i < filtroResultados.querySelectorAll("*").length; i++) {
                        if (e.target !== filtroResultados.querySelectorAll("*")[i] && e.target !== filtroResultados && e.target !== filtroResultadosIcone) {
                            variaveisGlobais.trocarSeta(document.querySelector(".icone-refinar-busca"));
                            break;
                        }
                    }
                }
            }, 200);
        }
    } else {
        document.getElementById("main-nav").style.top = 0;
    }
});

//exibir mapa do site
document.querySelector(".mapa-div").addEventListener("click", function(e){
    e.preventDefault();
    variaveisGlobais.mapaDOM();
});


//animar menu principal
document.querySelector(".icone-menu-mobile").addEventListener("click", function(){
    document.getElementById("main-nav").classList.toggle("action");
    for (i = 0; i < document.querySelectorAll(".deslocar").length; i++) {
        document.querySelectorAll(".deslocar")[i].classList.toggle("action");
    }
    document.querySelector("body").classList.toggle("noScroll");
    if ($(window).width() < 1024) {
        if (document.querySelector(".icone-menu-mobile").classList.contains("fa-bars")) {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
        setTimeout(function(){
            document.querySelector(".icone-menu-mobile").classList.toggle("fa-bars");
            document.querySelector(".icone-menu-mobile").classList.toggle("fa-times");
            document.getElementById("abrir-menu-desktop").classList.toggle("fa-bars");
            document.getElementById("abrir-menu-desktop").classList.toggle("fa-times");
        }, 500);
    }
}, false);


//animar menu principal - desktop - página principal
document.querySelector("#abrir-menu-desktop.fa-bars").addEventListener("click", function(){
    document.getElementById("main-nav").classList.toggle("action");
    for (i = 0; i < document.querySelectorAll(".deslocar").length; i++) {
        document.querySelectorAll(".deslocar")[i].classList.toggle("action");
    }
    document.querySelector("body").classList.toggle("noScroll");
    document.querySelector(".icone-menu-mobile").classList.toggle("fa-bars");
    document.querySelector(".icone-menu-mobile").classList.toggle("fa-times");
    if (document.getElementById("main-nav").classList.contains("action")) {
        desktopBarTopo();
        document.getElementById("main-nav").style.top = $(".top-bar-desktop").offset().top + 50 + "px";
    }
}, false);

//acionar botão de busca, função dupla
document.querySelector(".busca-e-navegacao .btn-busca").addEventListener("click", function(e){
    var inputText = document.getElementById("input-busca-geral").value;

    //se não tem texto, prevent default. se tem texto, busca.
    if(!inputText) {
        e.preventDefault();        
    }

    //foco no input quando clica na lupa:
    if (!document.getElementById("input-busca-geral").classList.contains("action")) {
        document.getElementById("input-busca-geral").focus();
    }

    //exibindo e omitindo o campo de busca
    if (!document.getElementById("input-busca-geral").classList.contains("action")) {
        document.getElementById("input-busca-geral").classList.add("action");
    }
}, false);

//acionar botão de busca, função dupla - DESKTOP
document.querySelector(".busca-e-navegacao-desktop .btn-busca").addEventListener("click", function(e){
    var inputText = document.getElementById("input-busca-geral-desktop").value;
    desktopBarTopo();

    //se não tem texto, prevent default. se tem texto, busca.
    if(!inputText) {
        e.preventDefault();
    }

    //foco no input quando clica na lupa:
    if (!document.getElementById("input-busca-geral-desktop").classList.contains("action")) {
        document.getElementById("input-busca-geral-desktop").focus();
    }

    //exibindo e omitindo o campo de busca
    if (!document.getElementById("input-busca-geral-desktop").classList.contains("action")) {
        document.getElementById("input-busca-geral-desktop").classList.add("action");
    }
}, false);


//retornando o botão de busca ao estado inicial (sem função submit)
document.getElementById("input-busca-geral").addEventListener("blur", function(){
    var inputText = document.getElementById("input-busca-geral").value;
    if (!inputText) {
        document.getElementById("input-busca-geral").classList.remove("action");        
    }
}, false);

//retornando o botão de busca ao estado inicial (sem função submit) - DESKTOP
document.getElementById("input-busca-geral-desktop").addEventListener("blur", function(){
    var inputText = document.getElementById("input-busca-geral-desktop").value;
    if (!inputText) {
        document.getElementById("input-busca-geral-desktop").classList.remove("action");
    }
}, false);

//animar itens do menu
document.getElementById("main-menu").addEventListener("click", function(e){

    function menuSelection(selected, selectedOld, variaveisGlobais) {

        if (e.target.classList.contains("menu-item")) {
            document.querySelectorAll("nav")[1].classList.toggle("action");
            setTimeout(function(){
                document.querySelector(".icone-menu-mobile").classList.toggle("fa-bars");
                document.querySelector(".icone-menu-mobile").classList.toggle("fa-times");
            }, 500);
            return;
        } else {
            selected = e.target;
            //selecionando (ou desselecionando) o menu
            if (selected.classList.contains("selected")) {
                selected.classList.remove("selected");
                setTimeout(function(){
                    variaveisGlobais.trocarSeta(e.target.lastElementChild.firstElementChild);
                }, 150);

                selected = "";
                selectedOld = "";
            } else {
                selected.classList.add("selected");

                setTimeout(function(){
                    variaveisGlobais.trocarSeta(e.target.lastElementChild.firstElementChild);
                }, 150);

                if (selectedOld && selected !== selectedOld) {
                    selectedOld.classList.remove("selected");
                    variaveisGlobais.trocarSeta(selectedOld.lastElementChild.firstElementChild);
                }
                selectedOld = e.target;
            }
            if (selectedOld && selectedOld !== e.target) {
                selectedOld.classList.remove("selected"); //eliminando seleção n1 anterior
                variaveisGlobais.trocarSeta(selectedOld.lastElementChild.firstElementChild);
            }

            //passando os valores da função para as respectivas variáveis globais
            if (e.target.classList.contains("n1")) {
                variaveisGlobais.selectedN1 = selected;
                variaveisGlobais.selectedN1Old = selectedOld;

                //resetando os demais menus (trocando orientação de setas):
                if (variaveisGlobais.selectedN2) {
                    variaveisGlobais.selectedN2Old = variaveisGlobais.selectedN2;
                    variaveisGlobais.trocarSeta(variaveisGlobais.selectedN2Old.lastElementChild.firstElementChild);
                    variaveisGlobais.selectedN2 = "";
                }
                if (variaveisGlobais.selectedN3) {
                    variaveisGlobais.selectedN3Old = variaveisGlobais.selectedN3;
                    variaveisGlobais.trocarSeta(variaveisGlobais.selectedN3Old.lastElementChild.firstElementChild);
                    variaveisGlobais.selectedN3 = "";
                }

            } else if (e.target.classList.contains("n2")) {
                variaveisGlobais.selectedN2 = selected;
                variaveisGlobais.selectedN2Old = selectedOld;

                if (variaveisGlobais.selectedN3) {
                    variaveisGlobais.selectedN3Old = variaveisGlobais.selectedN3;
                    variaveisGlobais.trocarSeta(variaveisGlobais.selectedN3Old.lastElementChild.firstElementChild);
                    variaveisGlobais.selectedN3 = "";
                }

            } else if (e.target.classList.contains("n3")) {
                variaveisGlobais.selectedN3 = selected;
                variaveisGlobais.selectedN3Old = selectedOld;
            }
        }
    }

    function autoScroll(e) {
        if (!variaveisGlobais.desktopDef) {
            let offsetFull,
                offsetUp;
            //rolando a tela para o menu desejadso
            if (document.querySelector(".top-bar").classList.contains("topbar-up")  || e.target.getBoundingClientRect().top > 200) {
                if ($(window).width() < 500) {
                    offsetFull = -75;
                    offsetUp =  -115;
                } else if ($(window).width() >= 500 && $(window).width() <= 1024) {
                    offsetFull = -95;
                    offsetUp = -135;
                }
                setTimeout(function(){
                    variaveisGlobais.scrollTo(e.target, offsetFull);                    
                }, 450);
            } else if (!document.querySelector(".top-bar").classList.contains("topbar-up")) {
                setTimeout(function(){
                    variaveisGlobais.scrollTo(e.target, offsetUp);                    
                }, 450);
            }
        }

    }

    //////////////////////////////////
    //Selecionando Itens de menu:
    //////////////////////////////////

    selecionarItensMenu = (function() {
        if (e.target.classList.contains("n1")) { //selecionando menus n1
        menuSelection(variaveisGlobais.selectedN1, variaveisGlobais.selectedN1Old, variaveisGlobais);
        autoScroll(e);

        //removendo seleções dos demais subníveis
        if (variaveisGlobais.selectedN2Old) {
            variaveisGlobais.selectedN2Old.classList.remove("selected"); //eliminando seleção n2 anterior
        }
        if (variaveisGlobais.selectedN3Old) {
            variaveisGlobais.selectedN3Old.classList.remove("selected"); //eliminando seleção n3 anterior
        }

        } else if (e.target.classList.contains("n2")) {//selecionando menus n2
            menuSelection(variaveisGlobais.selectedN2, variaveisGlobais.selectedN2Old, variaveisGlobais);
            autoScroll(e);

            //removendo seleção do subnível n3
            if (variaveisGlobais.selectedN3Old) {
                variaveisGlobais.selectedN3Old.classList.remove("selected"); //eliminando seleção n3 anterior
            }

        } else if (e.target.classList.contains("n3")) { //selecionando menus n3
            menuSelection(variaveisGlobais.selectedN3, variaveisGlobais.selectedN3Old, variaveisGlobais);
            autoScroll(e);

        } else if (e.target.classList.contains("n4")) { //selecionando itens n4

            document.getElementById("main-nav").classList.toggle("action");
            setTimeout(function(){
                document.querySelector(".busca-e-navegacao> i.fa").classList.toggle("fa-bars");
                document.querySelector(".busca-e-navegacao> i.fa").classList.toggle("fa-times");
            }, 500);
            return;
        }

        //para menus de primeiro nível
        if (e.target.classList.contains("n1") && e.target.nextElementSibling.classList.contains("hidden")) {
            //escondendo os demais menus de nível 1
            for (i = 0; i < document.querySelectorAll("#main-menu ul").length; i++) {
                document.querySelectorAll("#main-menu ul")[i].classList.add("hidden");
                document.querySelectorAll("#main-menu ul")
            }

            //abrindo o menu selecionado
            e.target.nextElementSibling.classList.remove("hidden");
        } else if (e.target.classList.contains("n1") && !e.target.nextElementSibling.classList.contains("hidden")) {
            e.target.nextElementSibling.classList.add("hidden");
        }

        //para sumbmenus n2
        if (e.target.classList.contains("n2") && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains("menu") && e.target.nextElementSibling.classList.contains("hidden")) {
            //escondendo os demais menus nível 2
            for (i = 0; i < document.querySelectorAll(".n2 + ul").length; i++) {
                document.querySelectorAll(".n2 + ul")[i].classList.add("hidden");
            }
            //escondendo os demais menus nivel 3
            for (i = 0; i < document.querySelectorAll(".n3 + ul").length; i++) {
                document.querySelectorAll(".n3 + ul")[i].classList.add("hidden");
            }
            //abrindo o menu selecionado
            e.target.nextElementSibling.classList.remove("hidden");
        } else if (e.target.classList.contains("n2") && e.target.nextElementSibling &&e.target.nextElementSibling.classList.contains("menu") && !e.target.nextElementSibling.classList.contains("hidden")) {
            e.target.nextElementSibling.classList.add("hidden");
        }

        //para sumbmenus n3
        if (e.target.classList.contains("n3") && e.target.nextElementSibling && e.target.nextElementSibling.classList.contains("menu") && e.target.nextElementSibling.classList.contains("hidden")) {

            //escondendo os demais submenus n3
            for (i = 0; i < document.querySelectorAll(".n3 + ul").length; i++) {
                document.querySelectorAll(".n3 + ul")[i].classList.add("hidden");
            }
            e.target.nextElementSibling.classList.remove("hidden");
        } else if (e.target.classList.contains("n3") && e.target.nextElementSibling &&e.target.nextElementSibling.classList.contains("menu") && !e.target.nextElementSibling.classList.contains("hidden")) {
            e.target.nextElementSibling.classList.add("hidden");
        }
    })(e, variaveisGlobais);

}, false);

////////////////////////////////////////////
/////////// CONTROLE ACESSO RÁPIDO
////////////////////////////////////////////

document.querySelector(".acesso-rapido-desktop").addEventListener("click", function(e){
    desktopBarTopo();
    var controle = document.getElementById("acesso-rapido-controle-desktop");
    variaveisGlobais.trocarSeta(controle);
    document.querySelector(".acesso-rapido-desktop").classList.toggle("aberto");
});

////////////////////////////////////////////
/////////// CONTROLE DE LOGIN
////////////////////////////////////////////

//login no rodapé
if (document.querySelector(".footer-login-header")) {
    document.querySelector(".footer-login-header").addEventListener("click", function(e){
        variaveisGlobais.trocarSeta(document.querySelector(".footer-login-header .seta"));
        if (document.querySelector(".footer-login-header .seta").classList.contains("fa-caret-down")) {
            document.getElementById("formLoginRodape").classList.remove("aberto");
            document.querySelector(".login-form-desktop").classList.remove("aberto");
        } else {
            document.getElementById("formLoginRodape").classList.add("aberto");
            document.querySelector(".login-form-desktop").classList.add("aberto");
        }
    });
}

//login em desktops
if (document.querySelector(".login-header")) {
    for (let i = 0; i < document.querySelectorAll(".login-header").length; i++) {
        document.querySelectorAll(".login-header")[i].addEventListener("click", function(e){
            if (variaveisGlobais.desktopDef) {
                desktopBarTopo();
            }
            variaveisGlobais.trocarSeta(document.querySelectorAll(".login-header .seta")[i]);
            if (document.querySelectorAll(".login-seta")[i].classList.contains("fa-caret-down")) {
                document.querySelectorAll(".form-login-topbar")[i].classList.remove("aberto");
                if (document.querySelectorAll(".login-form-desktop")[i]) {
                    document.querySelectorAll(".login-form-desktop")[i].classList.remove("aberto");
                }

            } else {
                document.querySelectorAll(".form-login-topbar")[i].classList.add("aberto");
                if (document.querySelectorAll(".login-form-desktop")[i]) {
                    document.querySelectorAll(".login-form-desktop")[i].classList.add("aberto");
                }
            }
        });
    }
}

/////////// FECHAR MAPA DO SITE
document.querySelector(".fechar-mapa").addEventListener("click", function() {
    variaveisGlobais.controlarVisibilidade("ocultar", "#fechar-mapa");
    variaveisGlobais.controlarVisibilidade("ocultar", "#mapa-container");
    document.getElementsByTagName("body")[0].classList.remove("fixo");
});


//contolando a exibição dos filtros de pesquisa
if (document.querySelector(`.filtro-resultados`)) {
    document.querySelector(".refinar-busca-div").addEventListener("click", function(e){   
        document.querySelector(".refinar-busca-div .icone-refinar-busca").classList.toggle("fa-caret-down");
        document.querySelector(".refinar-busca-div .icone-refinar-busca").classList.toggle("fa-caret-up");   
        document.querySelector(".filtro-resultados").classList.toggle("aberto");    
    });
}

//ocultando, temporariamente, a agenda
document.querySelector('.agenda-desktop').style = 'display:none;';
if(document.getElementById(`secao-agenda`)) {
    document.getElementById(`secao-agenda`).style = 'display: none;';

}
console.log('>>>>>> agenda oculta, temporariamente');