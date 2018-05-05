///////////Exibição do resultado da busca/////////////

//obter os parâmetros de busca presentes na URL da página
var url = window.location.href.split("/").pop();
url = url.split(/[?&]/); //regexp

//parâmetros de busca e paginação
var inputBusca,
    termoInformado = false;
resultadosPorPagina = 10,
    classificacao = ["pagina", "noticia", "evento", "informe", "video", "foto", "depoimento"],
    classificacaoTemp = [],
    relacaoTermos = "todas",
    quantidadeNumerosPagina = 2, //à direita e à esquerda da página atual
    paginaAtual = Number(url[0]),
    termoDeBusca = "",
    dataDesde = [new Date(2014, 0, 1), 0],
    dataAte = [new Date(), 0];

//A variável ordenação é um objeto que apresenta todos os parâmetros da ordem de exibição dos resultados da busca. Por padrão, a ordenação tem como primeiro parâmetro a data de publicação e, em seguida, a ordem alfabética dos títulos, caso haja mais de um resultado publicado na mesma data.
var ordenacao = { data: -1, titulo: 1 };

//refatora os parâmetros com base na URL
for (let i = 1; i < url.length; i++) {
    let trechoAtual = url[i].split("=");
    switch (trechoAtual[0]) {
        case "input-busca":
        case "input-busca-geral":            
            inputBusca = decodeURIComponent(trechoAtual[1]);
            if (inputBusca !== '+' && inputBusca !== '') {
                inputBusca = inputBusca.replace(/\+/g, " ");
                termoInformado = true;
            } 
            break;
        case "resultadosPorPagina":
            resultadosPorPagina = Number(trechoAtual[1]);
            break;
        case "classificacao":
            classificacaoTemp.push(trechoAtual[1]);
            break;
        case "relacaoTermos":
            relacaoTermos = trechoAtual[1];
            break;
        case "ordenacao": //Alteração da ordem por data
            if (trechoAtual[1] === "maisAntigos") {
                ordenacao.data = 1;
            }
            break;
        case "dataDesde":
            if (trechoAtual[1] != 0) { //tem que ser loosely equality, por causa do "use strict mode"!!!!
                dataDesde = moment(new Date()).subtract(trechoAtual[1], "months");
                dataDesde = [dataDesde._d, trechoAtual[1]];
            }
            break;
        case "dataAte":
            dataAte = moment(new Date()).subtract(trechoAtual[1], "months");
            dataAte = [dataAte._d, trechoAtual[1]];
            break;
    }
}
if (classificacaoTemp.length > 0) {
    classificacao = classificacaoTemp;
}

//Formata o termo de busca, de acordo com a relação entre os termos
switch (relacaoTermos) {
    case "todas":
        var stringCache = inputBusca.split(" ");
        for (let i = 0; i < stringCache.length; i++) {
            termoDeBusca += "\"" + stringCache[i] + "\"";
        }
        break;
    case "qualquer":
        termoDeBusca = inputBusca;
        break;
    case "exata":
        termoDeBusca = "\"" + inputBusca + "\"";
        break;
}

var filtro = { natureza: classificacao, data: { $gte: dataDesde[0], $lte: dataAte[0] } };
var opcoes = JSON.stringify({
    /* select: { texto: 0 }, */
    page: paginaAtual, limit: resultadosPorPagina, sort: ordenacao, populate: "contatos"
});

//definindo se busca por termoDeBusca ou apenas pelos outros parâmetros de busca, se um termo não for informado:
if (termoInformado) {
    filtro.$text = { $search: termoDeBusca };
} 

//requisição via AJAX
var recuperarBusca = async function () {
    await $.ajax({
        type: 'GET',
        url: "/recuperarBusca",
        data: { filtro, opcoes, quantidadeNumerosPagina, paginaAtual },
        dataType: "json"
    }).done(function (msg) {
        if (msg) {
            exibirResultados(msg);
        }
    }).fail(function (msg) {
        console.log("Fail! " + msg.data);
    });
};


//exibição dos resultados da busca
var exibirResultados = function (retornoBusca) {
    var resultadosHTML;
    retornoBusca.resultados.total == 0 ?
        resultadosHTML = `<h2>Não há resultados de pesquisa para o termo "${inputBusca}".</h2>` :
        resultadosHTML = `<p>Foram encontrados ${retornoBusca.resultados.total} resultados.</p>`;
    for (let i = 0, docs = retornoBusca.resultados.docs; i < docs.length; i++) {
        resultadosHTML += `<a href="/conteudos/${docs[i]._id}"><article class="conteudo borda-${docs[i].natureza}">
            <div class="resultado-header">
                <h2>${docs[i].titulo}</h2>`;
        if (docs[i].data) {
            resultadosHTML += `<span>${docs[i].dataAmigavel}</span>`;
        }
        resultadosHTML += `</div>
            <div class="natureza">
                <span>${docs[i].natureza}</span>
            </div>`;
        if (docs[i].imagem) {
            resultadosHTML += `<div class="img-news-container">
                <img src='/img/conteudos/${docs[i]._id}XSm.jpg' alt='${docs[i].titulo}'>
            </div>`;
        }
        if (docs[i].midia) {
            resultadosHTML += `<div class="img-news-container">
                <i class='resultado-${docs[i].natureza} fa'></i>
            </div>`;
        }
        if (docs[i].texto) {
            resultadosHTML += `<p>${docs[i].texto.substring(0, 160).replace(/(<([^>]+)>)/ig," ")}</p>`;
        }
        resultadosHTML += `</article></a>`
    }
    document.querySelector(".resultados-container").insertAdjacentHTML("afterbegin", resultadosHTML);

    //numeração das páginas
    var paginasHTML = ``,
        urlBusca = "?" + window.location.href.split("?").pop();
    if (retornoBusca.paginacao.exibirAnterior) {
        paginasHTML += `<a href="/busca/1${urlBusca}"><div>primeira</div></a>
            <a href="/busca/${retornoBusca.paginacao.paginaAnterior}${urlBusca}"><i class="fa fa-caret-left"></i></a>`;
    } else {
        paginasHTML += `<a><div class="inativo">primeira</div></a>
            <a class="inativo"><i class="inativo fa fa-caret-left"></i></a>`;
    }
    for (let i = 0, paginas = retornoBusca.paginacao.paginas; i < paginas.length; i++) {
        paginasHTML += `<a href="/busca/${paginas[i].numero}${urlBusca}">
            <div id="${paginas[i].numero}" class="num-pagina ${paginas[i].paginaAtual}">
                ${paginas[i].numero}
            </div></a>`;
    }
    if (retornoBusca.paginacao.exibirProxima) {
        paginasHTML += `<a href="/busca/${retornoBusca.paginacao.proximaPagina}${urlBusca}"><i class="fa fa-caret-right"></i></a>
            <a href="/busca/${retornoBusca.resultados.pages}${urlBusca}"><div>ultima</div></a>`;
    } else {
        paginasHTML += `<a><i class="inativo fa fa-caret-right"></i></a>
            <a class="inativo"><div>ultima</div></a>`;
    }
    document.getElementById("resultados-busca-paginas").insertAdjacentHTML("beforeend", paginasHTML);

    //insere o termo buscado e os parâmetros previamente definidos no formulário de filtros
    if (inputBusca !== '+') {
        document.getElementById("input-busca").value = inputBusca;
    }
    document.getElementById("resultadosPorPagina").value = resultadosPorPagina;
    for (let i = 0; i < document.getElementsByName("classificacao").length; i++) {
        for (let j = 0; j < classificacao.length; j++) {
            if (document.getElementById("classificacao" + i).value === classificacao[j]) {
                document.getElementById("classificacao" + i).checked = true;
                break;
            }
        }
    }
    for (let i = 0; i < document.getElementsByName("relacaoTermos").length; i++) {
        if (document.getElementById("relacaoTermos" + i).value === relacaoTermos) {
            document.getElementById("relacaoTermos" + i).checked = true;
            break;
        }
    }
    if (ordenacao.data == 1) {
        document.getElementById("ordenacao1").checked = true;
    } else {
        document.getElementById("ordenacao0").checked = true;
    }
    document.getElementById("dataDesde").value = dataDesde[1];
    document.getElementById("dataAte").value = dataAte[1];
};

/////////////////////////////////////////////////////
//////// CONTROLE DO FILTRO DE RESULTADOS
/////////////////////////////////////////////////////

var naturezas = document.querySelectorAll("#classificacao div > input");

//função que verifica as opções de natureza checadas, ou não,, a partir do índice indicado como argumento
var desmarcados = function (indexInicio) {
    var contador = 0;
    for (let i = indexInicio; i < naturezas.length; i++) {
        if (!naturezas[i].checked) {
            contador++;
        }
    }
    if (contador === naturezas.length - indexInicio) {
        return true;
    }
};

document.getElementById("classificacao").addEventListener("change", function (e) {
    if (naturezas[0].checked && desmarcados(1)) {
        variaveisGlobais.controlarVisibilidade("ocultar", "#ordenacao");
        variaveisGlobais.controlarVisibilidade("ocultar", "#intervaloDesde");
        variaveisGlobais.controlarVisibilidade("ocultar", "#intervaloAte");
    } else {
        variaveisGlobais.controlarVisibilidade("exibir", "#ordenacao");
        variaveisGlobais.controlarVisibilidade("exibir", "#intervaloDesde");
        variaveisGlobais.controlarVisibilidade("exibir", "#intervaloAte");
    }

    if (desmarcados(0)) {
        for (let i = 0; i < naturezas.length; i++) {
            naturezas[i].checked = true;
        }
    }
});

// Manipulação dos filtros de busca por data
document.getElementById("dataDesde").addEventListener("change", function (e) {
    var chaveOpcoes = [];
    switch (document.getElementById("dataDesde").value) {
        case "12":
            chaveOpcoes = [true, false, false, false];
            if (document.getElementById("dataAte").selectedIndex == 0) {
                document.getElementById("dataAte").selectedIndex = 1;
            }
            break;
        case "6":
            chaveOpcoes = [true, true, false, false];
            if (document.getElementById("dataAte").selectedIndex <= 1) {
                document.getElementById("dataAte").selectedIndex = 2;
            }
            break;
        case "3":
            chaveOpcoes = [true, true, true, false];
            if (document.getElementById("dataAte").selectedIndex <= 2) {
                document.getElementById("dataAte").selectedIndex = 3;
            }
            break;
        case "1":
            chaveOpcoes = [true, true, true, true];
            if (document.getElementById("dataAte").selectedIndex <= 3) {
                document.getElementById("dataAte").selectedIndex = 4;
            }
            break;
        default:
            chaveOpcoes = [false, false, false, false];
            break;
    }
    for (let i in chaveOpcoes) {
        document.getElementById("dataAte")[i].disabled = chaveOpcoes[i];
    }
});

//ações quando a página é carregada
window.addEventListener(`DOMContentLoaded`, function () {
    //executar a requisição ao carregar a página
    recuperarBusca();

    //exibindo os ícones do youtube ou instagram
    const resultadosVideos = document.querySelectorAll(`.resultado-video`),
        resultadosFotos = document.querySelectorAll(`.resultado-foto`);
    if (resultadosFotos) {
        for (let i = 0; i < resultadosFotos.length; i++) {
            resultadosFotos[i].classList.add('fa-instagram')
        }
    }
    if (resultadosVideos) {
        for (let i = 0; i < resultadosVideos.length; i++) {
            resultadosVideos[i].classList.add('fa-youtube-play');
            resultadosVideos[i].parentElement.parentElement.classList.remove('borda-video');
            resultadosVideos[i].parentElement.parentElement.classList.add('borda-foto');

        }
    }
});
