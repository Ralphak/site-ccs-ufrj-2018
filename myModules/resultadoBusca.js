/*/////////////////FUNÇÃO PARA PAGINAÇÃO AUTOMÁTICA ///////////////////

argumentos: 
array - UM CONJUNTO DE DOCUMENTOS DE DETERMINADA COLEÇÃO
numConteudos - O TOTAL DE DOCUMENTOS ENCONTRADOS NA BUSCA
numeroDePaginas - O NÚMERO TOTAL DE PÁGINAS CONTENDO OS RESULTADOS ENCONTRADOS
npp - NÚMERO DE RESULTADOS POR PÁGINA (CUSTOMIZÁVEL!)
npNav - A QUANTIDADE DE NÚMEROS DE PÁGINA NO RODAPÉ QUE ACOMPANHAM A PÁGINA ATUAL
indexInicio - O NÚMERO DA PÁGINA ATUAL
req - O REQUEST DA BUSCA, A FIM DE RETERMOS A QUERYSTRING
*/
var numPaginas = function(array, numConteudos, numeroDePaginas, npp, npNav, paginaAtual/* , req */) {
    //correção de números importados como string
    npNav = Number(npNav);
    paginaAtual = Number(paginaAtual);

    //declarando variáveis
    var paginas = [],
        conteudosPagina = [],                 
        paginaAnterior = Number(paginaAtual - 1),
        proximaPagina = Number(paginaAtual + 1),
        //urlBusca = "?" + req.originalUrl.split("?")[1],
        exibirAnterior = (paginaAtual > 1),
        exibirProxima = (paginaAtual < numeroDePaginas);
    
    //gerando os números de páginas 
    if (paginaAtual <= npNav ) {
        var inicio = 1;
        var fim = npNav*2 + 1;
    } else if (paginaAtual + npNav >= numeroDePaginas) {
        var inicio = numeroDePaginas - (npNav*2);
        var fim = numeroDePaginas;
    } else {
        var inicio = paginaAtual - npNav;
        var fim = paginaAtual - npNav + npNav*2;
    }
    
    for (let i = inicio; i <= fim; i++) {
        if (i > 0 && i <= numeroDePaginas) {
            if (i === paginaAtual) {
                paginas.push({numero: i, paginaAtual: "pagina-atual"});
            } else {
                paginas.push({numero: i, paginaAtual: ""});
            }
            
        }
    }
    return {               
        paginas,
        exibirAnterior,
        exibirProxima,
        paginaAnterior,
        proximaPagina,
        paginaAtual,
        numeroDePaginas
        //urlBusca
    }
            
}

module.exports = numPaginas;