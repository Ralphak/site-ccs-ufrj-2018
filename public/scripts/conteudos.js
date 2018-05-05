var selectedOld,
    selected,
    conteudo,
    conteudos,
    link = document.location.href.split("/").pop(),
    equipe;


//a variável dadosBusca é definida em função do objetivo da requisição ajax. Se queremos recuperar um conteúdo específico, dados busca conterá o id do conteúdo (href.split("/")). Caso seja busca genérica, para localizar, editar ou apagar conteúdos, dadosBusca será objeto vazio, ou conterá os termos buscados. assim:
if (document.querySelector("inserir-conteudos")) {
    var dadosBusca = {};
} else if (document.getElementById("query")){
    var termos,
        dadosBusca;
} else {
    var dadosBusca = {"_id": link}
}

//função para recuperar as equipes que compõem os conteúdos
var recuperarEquipe = async function () {
    await $.ajax({type: 'GET',
        url: "/recuperarEquipe",
        data: {"grupos": link},
        dataType: "json"
    }).done( function(msg) {
        if (msg) {
            //ordenar todos os contatos por ordem alfabética
            msg.sort(ordenar); 
            equipe = msg;
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
    variaveisGlobais.removePreLoaders(".equipe");
};

//separar os tipos de documento
let separarDocumentos = (docs) => {
    let atas = [], diversos = [], docsObj = {};
    for (let i = 0; i < docs.length; i++) {
        if (docs[i].tipo === 'ata') {
            atas.push(docs[i]);
        } else if (docs[i].tipo === 'diversos') {
            diversos.push(docs[i]);
        }
    }
    if (atas.length > 0) {        
        docsObj.atas = atas.sort(ordenarDocs);
    }
    if (diversos.length > 0) {
        docsObj.diversos = diversos;
    } 
    return docsObj;             
};

let textoCamelCase = (texto) => {
    texto.trim();
    let textoSemEspacos = texto.split(" ")[0].toLowerCase();
    for (let i = 1; i < texto.split(" ").length; i++) {
        textoSemEspacos += texto.split(" ")[i].slice(0,1).toUpperCase() + texto.split(" ")[i].slice(1, texto.split(" ")[i].length).toLowerCase();
    }
    let textoNormalizado = textoSemEspacos.normalize('NFD').replace(/[\u0300-\u036f]/g, "");  
    return textoNormalizado;
};

var pastaParaSalvar = (docs) => {
    if (conteudos.natureza === 'noticia' || conteudos.natureza === 'informe' || conteudos.natureza === 'evento') {
        return 'diversos';
    } else {
        return docs[0].pagina;
    }
};

//o parâmetro ano refere-se a todos os anos nos quais há atas para o conteúdo em questão
let inserirAtas = (atas, anos) => {   
    var pasta = pastaParaSalvar(atas);   
    //gerando div dos anos
    for (let i = anos.length - 1; i >= 0; i--) {
        document.querySelector('.div-atas').insertAdjacentHTML('beforeend', `
        <div class = "div-atas-ano atas-${anos[i]} arquivos-menu">
            <div class="icon atas-icon">
                <i class="fa fa-caret-down seta"></i>
            </div>
            <h4 class='div-ano ano-${anos[i]}' >${anos[i]}</h4>
            <div class='docs'></div>
        </div>
        `);
    }
    for (let i = 0; i < atas.length; i++) {
        document.querySelector(`.atas-${atas[i].ano} .docs`).insertAdjacentHTML('beforeend', `<div><a href='/docs/${pasta}/emUso/${atas[i]._id}' class='ata ata-ano-${atas[i].ano}' target='_blank'>${atas[i].nomeAmigavel}</a><i class='fa fa-trash apagar-arquivo hidden'></i></div>`);
    }
};

let rotinasExibicaoAtas = (atas) => {    
    //criando o div de atas    
    let ataDiv = `<div class = 'div-atas arquivos-menu'>
        <div class="icon atas-icon">
            <i class="fa fa-caret-down seta"></i>
        </div>
        <h3 class='div-docs'>Atas</h3>
    </div>`;
    document.querySelector(`.div-arquivos`).insertAdjacentHTML('beforeend', ataDiv);
    //determinando os anos para criação de divs
    let anosSemRepeticao = anosAtas(atas);
    inserirAtas(atas, anosSemRepeticao);       
};

//função que verifica quais os anos nos quais há atas registradas em uma determinada página
let anosAtas = (atas) => {
    let anos = [];
    for (let i = 0; i < atas.length; i++) {
        anos.push(atas[i].ano);
    }
    let anosSemRepeticao = Array.from(new Set(anos));       
    return anosSemRepeticao.sort(); 
}

let inserirDiversos = (docs) => {
    let pasta = pastaParaSalvar(docs);    
    docs.sort(ordenarDocs);
    for (let i = 0; i < docs.length; i++) {
        document.querySelector(`.div-diversos`).insertAdjacentHTML('beforeend', `<div><a href='/docs/${pasta}/emUso/${docs[i]._id}' target='_blank' class='diversos'>${docs[i].nomeAmigavel}</a><i class='fa fa-trash apagar-arquivo hidden'></i></div>`);
    }
};

let rotinasExibicaoDiversos = (diversos) => {
    let ataDiv = `
    <div class='div-diversos arquivos-menu'>
        <div class="icon diversos-icon">
            <i class="fa fa-caret-down seta"></i>
        </div>
        <h3 class='div-docs'>Diversos</h3>
    </div>`;
    document.querySelector(`.div-arquivos`).insertAdjacentHTML('beforeend', ataDiv);
    inserirDiversos(diversos);
};

let menuDocumentos = (e) => {
    e.target.classList.toggle('aberto');
    setTimeout(() => {
        variaveisGlobais.trocarSeta(e.target.firstElementChild.firstElementChild);        
    }, 250);
};

let exibirArquivosDOM = async () => {
    let obj = {
        pagina: link
    };                
    let docs = await variaveisGlobais.ajax('/conteudos/recuperarDocs', 'get', obj),
        docsObj = separarDocumentos(docs),
        arquivos = ``,
        containerAnteriorArquivos;
    if (docsObj.atas || docsObj.diversos) {
        arquivos = `
        <h2>Documentos:</h2>
        <div class = 'div-arquivos'></div>`;
    }
    document.querySelector('.conteudo') ? containerAnteriorArquivos = '.texto-container' : containerAnteriorArquivos = '.arquivos-container';
    document.querySelector(containerAnteriorArquivos).insertAdjacentHTML('afterend', arquivos);
    if (docsObj.atas) {
        rotinasExibicaoAtas(docsObj.atas);
    }
    if (docsObj.diversos) {
        rotinasExibicaoDiversos(docsObj.diversos);
    }
};

//seleciona arquivos para apagar (atas e diversos), na edição de conteúdos
let selecionarArquivosApagar = (e, arquivosParaApagar) => {     
    e.preventDefault();
    e.target.classList.toggle('selecionado-para-apagar')
    e.target.nextElementSibling.classList.toggle('hidden');
    if(arquivosParaApagar.includes(e.target.innerHTML)) {
        for (let i = 0; i < arquivosParaApagar.length; i++) {
            if(arquivosParaApagar[i] === e.target.innerHTML) {
                arquivosParaApagar.splice(i, 1);
            }
        }
    }  else {
        arquivosParaApagar.push(e.target.innerHTML);
    }  
    if (arquivosParaApagar.length === 0) {
        variaveisGlobais.controlarVisibilidade('ocultar',`.apagar-arquivos-icone`);
    } else {
        variaveisGlobais.controlarVisibilidade('exibir',`.apagar-arquivos-icone`);
    }      
    //destacando os anos que têm atas
    destacarDivAta(e);
};

let destacarDivAta = (e) => {
    if (e.target.classList.contains('ata')) {
        let ano = e.target.innerHTML.split(' ').pop(),
            atasDoAno = document.querySelectorAll(`.ata-ano-${ano}`),
            containerAtas = document.querySelector(`.ano-${ano}`);
            ataSelecionada = false;   
            for (let i = 0; i < atasDoAno.length; i++) {
                if (atasDoAno[i].classList.contains('selecionado-para-apagar')) {                
                    ataSelecionada = true;
                    break;
                }
            }
            ataSelecionada ? containerAtas.classList.add('tem-ata-selecionada') : containerAtas.classList.remove('tem-ata-selecionada');
    }
}
let excluirArquivosDOM = () => {
    let arquivos = document.querySelectorAll(`.selecionado-para-apagar`);        
    for (let i = 0; i < arquivos.length; i++) {                        
        arquivos[i].parentElement.outerHTML = '';            
    }    
};

//rotinas de exibição de documentos
let rotinasDocumentos = async () => {   
    await exibirArquivosDOM();   

    //listener para os divs de arquivos
    if (document.querySelector('.div-arquivos')) {
        let apagarArquivosBtn = document.querySelector('.apagar-arquivos-icone');
        let arquivosParaApagar = [];
        document.querySelector('.div-arquivos').addEventListener('click', (e) => {
            if (e.target.classList.contains('arquivos-menu')) {
                menuDocumentos(e);
            }
            //marcando arquivos para apagar
            if (document.querySelector(`.editar-conteudo`) && e.target.tagName === "A") {                
                selecionarArquivosApagar(e, arquivosParaApagar);
            }
        });
        //listener de scroll na página para posicionar o botãoi de apagar aquivos
        document.addEventListener("scroll", () => {
            if (apagarArquivosBtn) {
                if (document.querySelector(".footer").getBoundingClientRect().top > window.innerHeight) {
                    apagarArquivosBtn.style.bottom = "82px";
                    apagarArquivosBtn.style.top = "unset";        
                } else {
                    apagarArquivosBtn.style.top = document.querySelector(".footer").getBoundingClientRect().top - 130 + "px";
                    apagarArquivosBtn.style.bottom = "unset";
                }  
            }
        });
        //listener do botão de apagar arquivos
        if(document.querySelector(`.apagar-arquivos-icone`)) {
            document.querySelector(`.apagar-arquivos-icone`).addEventListener(`click`, async () => {            
                variaveisGlobais.exibirMensagem(`
                <div id='excluir-arquivos-div'>
                    <h3>Apagar os arquivos selecionados?</h3>
                    <div id="div-btn-apagar-demanda">                        
                        <button>sim</button>
                        <button>não</button>                   
                    </div>               
                </div>`);
                document.getElementById(`excluir-arquivos-div`).addEventListener('click', async(e) => {
                    if (e.target.innerHTML === 'sim' && !variaveisGlobais.disabled ) {
                        variaveisGlobais.clickingOnce();  
                        let res = await variaveisGlobais.ajax('/arquivos/excluir', 'post', {arquivos:arquivosParaApagar, pagina: link, natureza: conteudos.natureza}, variaveisGlobais.exibirMensagemAJAX, variaveisGlobais.exibirMensagemAJAX);
                        excluirArquivosDOM();  
                        variaveisGlobais.controlarVisibilidade('ocultar',`.apagar-arquivos-icone`);
                        variaveisGlobais.controlarVisibilidade('ocultar', '#mensagens-genericas')
                    } else if (e.target.innerHTML === 'não') {
                        variaveisGlobais.controlarVisibilidade('ocultar', '#mensagens-genericas')
                    }
                });
           });
        }
    }
};

/////////////////////////
//////// PÁGINA EQUIPE CCS
/////////////////////////

//função para ordenar por ordem alfabética os contatos
function ordenar(b,a) {
    if (a.nome < b.nome) {
        return -1;
    } else if (a.nome > b.nome) {
        return 1;
    } else {
        return 0;
    }
}

function ordenarDocs(b,a) {
    if (a.dataSessao > b.dataSessao) {
        if (a.dataSessao) { //é ata, ordem inversa, da mais recente pra mais antiga
            return 1;
        }
        return -1;
    } else if (a.dataSessao < b.dataSessao) {
        if (a.dataSessao) {
            return -1;
        }
        return 1;
    } else {
        return 0;
    }
}

//função para montar a equipe no DOM da página equipeDecania
var montarEquipe = function(contatos) {
    
    function inserirContato(contadorSetor, contadorContato) {
        //definindo os cargos
        let cargo = "";
        
        for (let i = 0; i < contatosDoSetor[contadorContato].cargos.length; i++) {
            if (link === contatosDoSetor[contadorContato].cargos[i].contexto) {
                cargo = contatosDoSetor[contadorContato].cargos[i].cargo;
                break;
            }
        }
        document.getElementById(setoresID[contadorSetor]).lastElementChild.firstElementChild.insertAdjacentHTML("beforeend", `<div class="contato" id="${contatosDoSetor[contadorContato].email}"></div>`);
        if (contatosDoSetor[contadorContato].foto) {
            document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", `<img src="/img/usuarios/${contatosDoSetor[contadorContato].email}.jpg">`);
        } else {
            document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", avatar);
        }
        if (contatosDoSetor[contadorContato].nome) {
            document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", `<p class="nome">${contatosDoSetor[contadorContato].nome}</p>`);
        }
        document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", `<p class="cargo">${cargo}</p>`);
        document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", `<p><a href="mailto:${contatosDoSetor[contadorContato].email}">${contatosDoSetor[contadorContato].email}</a></p>`);
        if (contatosDoSetor[contadorContato].telefone) {
            document.getElementById(contatosDoSetor[contadorContato].email).insertAdjacentHTML("beforeend", `<p>${contatosDoSetor[contadorContato].telefone}</p>`);
        }
    }
    //array com todos os setores, na ordem em que aparecerão na página
    var setores = ["Decania", "Superintendência Acadêmica", "Superintendência Gerencial", "Gabinete da Decania", "Coordenações do CCS", "Assessorias do CCS", "Seção de Ensino", "Biblioteca", "Escritório de Planejamento", "Seção Financeira", "Seção de Atividades Gerenciais", "Seção de Compras", "Seção de Pessoal", "Seção de Audiovisual", "Seção de Protocolo", "Seção de Rede e Informática", "Seção de Manutenção", "Seção de Vigilância Federal", "Administração da Sede", "Administração da Sede - Bloco N", "Segurança e Saúde do Trabalho (SST)", "Almoxarifado"];

    var setoresID = ["ccs-dec", "ccs-supAc", "ccs-supGer", "ccs-gabinete", "ccs-coord", "ccs-assessoria", "ccs-ensino", "ccs-bib", "ccs-eplan", "ccs-financeira", "ccs-atGer", "ccs-compras", "ccs-pessoal", "ccs-audiovisual", "ccs-protocolo", "ccs-rede", "ccs-manutencao", "ccs-vigilancia", "ccs-admSede", "ccs-admN", "ccs-sst", "ccs-almoxarifado"];     
    
    //criando, no DOM, a estrutura hierárquica
    for (let i = 0; i < setores.length; i++) {
        document.getElementById("div-equipe").insertAdjacentHTML("beforeend", `<div class="setores" id="${setoresID[i]}"><div class="setores-header"><h2>${setores[i]}</h2><i class="fa fa-caret-up"></i></div><div class="card-container"><div class="card-div"></div></div></div>`);
        var contatosDoSetor = [];

        for (let j = equipe.length - 1; j >= 0; j--) {
            if (equipe[j].grupos.includes(setoresID[i]) || equipe[j].grupos.includes(`${setoresID[i]}-chefe`)) {
                contatosDoSetor.push(equipe[j]);
                equipe.splice(j, 1);
            }
        }

        //inserindo no DOM o número de servidores em cada seção
        document.getElementById(setoresID[i]).classList.add(`servidores-${contatosDoSetor.length}`);

        //definido como centralizado o posicionamento dos cards nos setores com apenas 1 servidor
        if (contatosDoSetor.length < 2) {
            document.getElementById(setoresID[i]).lastElementChild.firstElementChild.style.justifyContent = "center";
            document.getElementById(setoresID[i]).lastElementChild.firstElementChild.style.width = "100%";
        }

        //inserindo os chefes de cada setor (exceto coordenações e assessorias)
        for (let l = contatosDoSetor.length - 1; l >= 0; l--) {
            if (!contatosDoSetor[l].grupos.includes("ccs-coord") && !contatosDoSetor[l].grupos.includes("ccse-assessoria") && contatosDoSetor[l].grupos.includes(setoresID[i] + "-chefe")) {
                inserirContato(i, l)
                contatosDoSetor.splice(l, 1);
                break;
            }
        }

        //inserindo os demais contatos de cada setor
        for (let k = 0; k < contatosDoSetor.length; k++) {
            inserirContato(i, k);
        }
    }
};


var exibirSetor = function(e) {
    e.target.parentElement.classList.toggle("up");
    variaveisGlobais.trocarSeta(e.target.lastElementChild);
};

//função para expandir ou retrair os DIV´s dos setores. e: evento | ações: expandir ou recolher | classe: a classe do(s) elemento(s) a serem manipulados | manipularClasses: string com a(s) classes(s) a serem incluídas, exlcuídas ou alternadas
var controlarExibicaoDiv = function(acao, classe, manipularClasses) {
    var divs = document.querySelectorAll("." + classe);
    if (acao === "expandir") {
        for (let i = 0; i < divs.length; i++) {
            divs[i].classList.remove(manipularClasses);
            divs[i].firstElementChild.lastElementChild.classList.add("fa-caret-up");
            divs[i].firstElementChild.lastElementChild.classList.remove("fa-caret-down");
        }
    } else if (acao === "recolher") {
        for (let i = 0; i < divs.length; i++) {
            divs[i].classList.add(manipularClasses);
            divs[i].firstElementChild.lastElementChild.classList.remove("fa-caret-up");
            divs[i].firstElementChild.lastElementChild.classList.add("fa-caret-down");
        }
    }
};

////////////////////////
//////// OUTRAS PÁGINAS
////////////////////////

var gerarContato = function (equipe, l) {
    var contatoDOM =`<div class="contato">`;
    if (equipe[l].foto) {
        contatoDOM+=`<img src="/img/usuarios/${equipe[l].foto}">`;
    } else {
        contatoDOM+=`<img src="/img/usuarios/avatar.svg">`;
    }
    let cargo;
    for (let i = 0; i < equipe[l].cargos.length; i++) {
         if (link === equipe[l].cargos[i].contexto) {
            cargo = equipe[l].cargos[i].cargo;
            break;
        }
    }
    contatoDOM+=`<p class="cargo"><strong>${cargo}</strong></p>
                <p><strong>${equipe[l].nome}</strong></p>
                <p><a href="mailto:${equipe[l].email}">${equipe[l].email}</a></p>`;
    if (equipe[l].telefone && equipe[l].telefone !== 0) {
        contatoDOM+=`<p>${equipe[l].telefone}</p>`;
    }
    contatoDOM+=`</div>`;
    return contatoDOM;
};

//função para recuperar o conteúdo a exibir via AJAX
var recuperarConteudo = async function(){
    await $.ajax({type:'GET',
        url: "/recuperarConteudo",
        data: dadosBusca,
        dataType: "json"
    }).done(function(msg){
        if(msg){
            //conteudo = msg[0];
            conteudos = msg;
            variaveisGlobais.removePreLoaders(".conteudo");
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
};

//função para exibir o conteúdo na página
var exibirConteudo = function(conteudo){
    document.querySelector(".conteudo").insertAdjacentHTML("afterbegin", `<div class="conteudo-titulo ${conteudo._id}"><h1>${conteudo.titulo}</h1></div>`);

    var corpo = `<div class="conteudo-corpo">`;
    if(conteudo.dataAmigavel){
        corpo += `<div class="conteudo-spans"><span class="span-${conteudo.natureza}">${conteudo.natureza}</span>|<span>${conteudo.dataAmigavel}</span></div>`;
    }
    if(conteudo.natureza === "foto" || conteudo.imagem === true){
        var legenda, imagem;
        conteudo.legenda ? legenda = conteudo.legenda : legenda = "";
        if (conteudo.natureza !== "foto") {
            imagem = `<div class='foto-container'><img src="/img/conteudos/${conteudo._id}.jpg" class="header borda-${conteudo.natureza}" alt="${conteudo.titulo}"></div>`;
        } else {
            imagem = `<img src="https://www.instagram.com/p/${conteudo.midia}/media/?size=l" class="header borda-${conteudo.natureza}" alt='${conteudo.titulo}'>`;
        }
        corpo += `
        <div class="img-news-container">
            ${imagem}
            <div class="legenda-principal">${legenda}</div>
        </div>`;
    }
    if(conteudo.natureza === "video"){
        corpo+=`<div class="youtube-player" data-id="${conteudo.midia}"></div>`;
    }
    if (conteudo.autor && conteudo.autor !== "undefined") {
        corpo+=`<span class="autor">Por: ${conteudo.autor}</span>`
    }
    corpo+=`<div class="texto-container ${conteudo.natureza}">${conteudo.texto}</div>`;
    
    if(equipe.length !== 0) {
        corpo+=`<h2>Equipe:</h2><div id="div-equipe">`;
        
        //inserindo o coordenador
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes(conteudo._id + "-coord")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
                break;
            }
        }
        //inserindo o substituto do coordenador
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes(conteudo._id + "-coordSub")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
                break;
            }
        }
        //inserindo o chefe do setor
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes(conteudo._id + "-chefe")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
                break;
            }
        }
        //inserindo o substituto do chefe do setor
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes(conteudo._id + "-chefeSub")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
                break;
            }
        }
        //inserindo os demais servidores do CCS
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes("servidorDecania")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
            }
        }
        //inserindo os servidores externos ao CCS
        for (let l = equipe.length - 1; l >= 0; l--) {
            if (equipe[l].grupos.includes("externo")) {
                corpo += gerarContato(equipe, l);
                equipe.splice(l, 1);
            }
        }
        //inserindo demais integrantes
        for (let l = equipe.length - 1 ; l >= 0; l--) {
            corpo += gerarContato(equipe, l);
        }
    }
    corpo+=`<div class="fb-like fb_share" data-href="http://www.ccs.ufrj.br/conteudos/${link}" data-width="550" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-title="teste" data-desc="" data-share="true"></div>
            <div class="button-div">
                <button class="voltar">voltar</button>
            </div>
        </div>`;
    document.querySelector(".conteudo").insertAdjacentHTML("beforeend", corpo);

    //excluindo o div de legenda, caso não haja:
    if (!legenda && document.querySelector(".legenda-principal")) {
        document.querySelector(".legenda-principal").outerHTML = "";
    }
};

let eliminarDivArquivos = () => {
    let mensagem = `<h3>Arquivos do conteúdo anterior apagados</h3>`;
    variaveisGlobais.exibirMensagem(mensagem, 3000, 'Atenção!');
    document.querySelector('.arquivos-container').innerHTML = '';
    id = 0;
};

let manipularFormularioNoticias = (e) => {
    if (e.target.previousElementSibling.id === "radio0") {
        variaveisGlobais.controlarVisibilidade("exibir", "#form-imagem");
        if (document.getElementById(`imagem`).checked) {
            variaveisGlobais.controlarVisibilidade("exibir", "#legenda-imagem");
        }
    }
    if(e.target.previousElementSibling.id !== "radio1" && e.target.previousElementSibling.id !== "radio2" && e.target.previousElementSibling.id !== "radio3") {
        variaveisGlobais.controlarVisibilidade("ocultar", "#autor-conteudo", 400);
        if (e.target.previousElementSibling.id !== "radio0") {
            variaveisGlobais.controlarVisibilidade("ocultar", "#legenda-imagem");
            variaveisGlobais.controlarVisibilidade("ocultar", "#form-imagem");
        }

    } else {
        variaveisGlobais.controlarVisibilidade("exibir", "#form-imagem");
        if (document.getElementById(`imagem`).checked) {
            variaveisGlobais.controlarVisibilidade("exibir", "#legenda-imagem");
        }
        variaveisGlobais.controlarVisibilidade("exibir", "#autor-conteudo");
    }
};

let divMidia = `
    <p>ID da mídia</p>
    <i class="fa fa-info"></i>
    <span class="dica">Inserir o ID do vídeo ou foto, obtido na URL do youtube ou instagram. Ex.: 'SxIui3hIT-4'</span>
    <div class="midia">
        <input type="text" name="midia" id="midia" required>
    </div>
    <br>
    <p>Classificação do vídeo (apenas para videos)</p>        
    <div>
        <input type="radio" name="subtipo" id="arte" value="arte e cultura" required>
        <label for="arte"><span></span>Arte e Cultura</label>
    </div>
    <div>
        <input type="radio" name="subtipo" id="academico" value="acadêmico">
        <label for="academico"><span></span>acadêmico</label>
    </div>
    <div>
        <input type="radio" name="subtipo" id="institucional" value="institucional">
        <label for="institucional"><span></span>institucional</label>
        <br>
    </div>
    <div>
        <label for="diaDeExibicao"><p>Data de exibição (apenas para transmissões de vídeo ao vivo)</p></label>
        <div class='conteudo__data-exibicao'>
            <input type='date' name='diaDeExibicao' id='diaDeExibicao' class='conteudo__dia'>
            <div class='conteudo__horario-container'>    
                <p class='conteudo__separador-data'>-</p>            
                <input type='number' min='7' max='20' name='horaDaExibicao' id='horaDaExibicao' class='conteudo__horario' placeholder='HH'> : 
                <input type='number' min='0' max='59' name='minutosDaExibicao' id='minutosDaExibicao' class='conteudo__horario' placeholder='MM'>
            </div>
        </div>
    </div>        
`;

let manipularFormularioFotoVideo = (e) => {
    let btnInserirArquivos = document.querySelector('.btn-inserir-arquivos'); 
    let midia = document.querySelector(".id-midia");
    if (e.target.previousElementSibling.id === "radio4" || e.target.previousElementSibling.id === "radio5") {
        midia.innerHTML = divMidia;
        btnInserirArquivos.classList.add('hidden');        
        btnInserirArquivos.previousElementSibling.classList.add('hidden');
        //rotinas de live videos
        document.getElementById(`diaDeExibicao`).addEventListener('change', e => {
            if (e.target.value) {
                e.target.required = true;
                document.getElementById(`horaDaExibicao`).required = true;
                document.getElementById(`minutosDaExibicao`).required = true;
            } else {
                e.target.required = false;
                document.getElementById(`horaDaExibicao`).required = false;
                document.getElementById(`minutosDaExibicao`).required = false;
            }
        });
    } else {
        midia.innerHTML = '';
        btnInserirArquivos.classList.remove('hidden');
        btnInserirArquivos.previousElementSibling.classList.remove('hidden');
    }
};

let manipularFormularioDepoimento = (e) => {
    if (e.target.previousElementSibling.id === 'radio6') {
        document.getElementById(`personagem`).required = true;
        document.getElementById(`atuacao`).required = true;
        document.querySelector('.form-titulo input').value = 'Personagem em foco';        
        document.querySelector(".form-titulo input").classList.add("ineditavel"); 
        document.querySelector(".form-nome input").classList.add("ineditavel");             
        variaveisGlobais.controlarVisibilidade('exibir', '.form-personagem-nome');               
        variaveisGlobais.controlarVisibilidade('exibir', '.form-personagem-atuacao');
        variaveisGlobais.controlarVisibilidade('ocultar', `.btn-inserir-arquivos`);
        inserirArquivos();
        document.querySelector(`.fechar-janela`).classList.add('hidden');        
        document.querySelector(`option[value='ata']`).disabled = true;
        document.querySelector(`option[value='diversos']`).disabled = true;
        document.getElementById(`nome`).required = false;
    } else {
        document.getElementById(`personagem`).required = false;
        document.getElementById(`atuacao`).required = false;
        document.getElementById(`nome`).value = '';
        document.getElementById(`titulo`).value = '';
        document.getElementById(`personagem`).value = '';
        document.getElementById(`atuacao`).value = '';
        document.querySelector(".form-nome input").classList.remove("ineditavel"); 
        document.querySelector(".form-titulo input").classList.remove("ineditavel"); 
        variaveisGlobais.controlarVisibilidade('ocultar', '.form-personagem-nome', 400);               
        variaveisGlobais.controlarVisibilidade('ocultar', '.form-personagem-atuacao', 400);        
        document.getElementById(`nome`).required = true;
        if (e.target.previousElementSibling.id !== "radio4" && e.target.previousElementSibling.id !== "radio5") {
            variaveisGlobais.controlarVisibilidade('exibir', `.btn-inserir-arquivos`);
        }
    }
};

let manipularFormularioConteudos = (e) => {
    //exibição do formulário completo
    document.querySelector(`.form-natureza`).classList.remove('sem-selecao');
    variaveisGlobais.controlarVisibilidade('exibir', `.conteudos-container-dados`);
    //controle de exibição dos divs do formulário de acordo com a natureza do conteúdo:
    manipularFormularioNoticias(e);    
    manipularFormularioFotoVideo(e);
    manipularFormularioDepoimento(e);       
};

let tratarNomeImagensCorpoTexto = () => {
    let imagens = document.querySelectorAll(`input[name='nomeImagem']`);
    for (let i = 0; i < imagens.length; i++) {                
        if(imagens[i].value.search('{') !== -1) {                    
            imagens[i].value = imagens[i].value.replace(/{/g, "");
        }
        if (imagens[i].value.search('}') !== -1) {
            imagens[i].value = imagens[i].value.replace(/}/g, "");
        }               
    }
};

//////////////////////////////////////////////////////////////
////////////////// LOCALIZAÇÃO DE CONTEÚDOS //////////////////
//////////////////////////////////////////////////////////////

//Exibindo o resultado da busca de conteudos em tela
var exibirConteudos = function(conteudos) {
    document.getElementById("resultados-busca-conteudo-container").innerHTML = "";
    document.getElementById("resultados-busca-conteudo-container").insertAdjacentHTML("beforeend", `<p>Foram encontrados ${conteudos.length} conteúdos</p>`);
    let img, youtube, dataAmigavel, borda;
    for (let i = 0; i < conteudos.length; i++) {
        conteudos[i].imagem ? img = `<img src="/img/conteudos/${conteudos[i]._id}XSm.jpg" alt="${conteudos[i].titulo}">`: img = "";
        
        conteudos[i].natureza === 'video' ? youtube = `<i class='fa fa-youtube-play'></i>`: youtube = "";
        conteudos[i].natureza !== 'video' ? borda = conteudos[i].natureza : borda = 'foto';
        conteudos[i].dataAmigavel ? dataAmigavel = conteudos[i].dataAmigavel : dataAmigavel = "";
        
        var conteudo = `
            <div class="conteudo borda-${borda}" id="${conteudos[i]._id}">
                <div class="resultado-header">
                    <h2>${conteudos[i].titulo}</h2>
                    <span>${dataAmigavel}</span>
                </div>
                <div class="natureza">
                    <span>${conteudos[i].natureza}</span>
                </div>
                <div class="img-news-container">
                    ${img}${youtube}
                </div>
                <p>${conteudos[i].texto.substring(0, 160).replace(/(<([^>]+)>)/ig," ")}...</p>
                <div class="editar">
                    <a href="/conteudos/editar/${conteudos[i]._id}"><button>editar</button></a>
                    <button id="btn.excluir.${conteudos[i]._id}" class="btn-excluir-conteudo">excluir</button>
                    <form action="/conteudos/excluir/${conteudos[i]._id}" method="post" id="form-${conteudos[i]._id}" class="formulario janela hidden opacidade-zero" accept-charset="utf-8">
                    <h3 class="header">Confirmação de exclusão</h3>
                    <h2>Tem certeza que deseja excluir este conteúdo? Esta ação não poderá ser desfeita</h2>
                    <div>
                        <input type="text" class="hidden" name="id" value="${conteudos[i]._id}">
                        <input type="text" class="hidden" name="natureza" value="${conteudos[i].natureza}">
                        <button data-id='${conteudos[i]._id}' class="requisicoes retornar">retornar</button>
                        <input type="submit" class="requisicoes recusar" value="excluir conteudo">
                    </div>

                    </form>
                </div>
            </div>`;
        document.getElementById("resultados-busca-conteudo-container").insertAdjacentHTML("beforeend", conteudo);
    }
    document.getElementById("resultados-busca-conteudo-container").insertAdjacentHTML("beforeend",
       `<div class="arquivo"></div>`
    );
};

/////////////////////////////
///////// LISTENERS /////////
/////////////////////////////

//localizando e excluindo conteúdos
if (document.getElementById("localizar-conteudo")) {
    document.getElementById("btn-submit").addEventListener("click", async function(e) {
        e.preventDefault();
        var naturezas = document.querySelectorAll("#natureza input");
        //capturando o termo de busca
        var termos = document.getElementById("query").value;

        //indicando se deve-se procurar apenas entre os destaques
        var destaque = document.getElementById("destaque").checked;

        //capturando os filtros de busca
        var filtros = [];
        for (let i = 0; i < naturezas.length; i++) {
            if (naturezas[i].checked) {
                filtros.push({natureza: naturezas[i].id})
            }
        }
        if (termos === "" && filtros.length === 0) {
            dadosBusca = {destaque};
        } else if (termos === "") {
            dadosBusca = {filtros: filtros, destaque};
        } else {
            dadosBusca = {
                termos: {$text:{$search:termos}},
                filtros: filtros,
                destaque
            };
        }
        await recuperarConteudo();
        exibirConteudos(conteudos);        
    });
    //excluindo conteúdos
    document.getElementById("resultados-busca-conteudo-container").addEventListener("click", function(e) {
        if (e.target.classList.contains('btn-excluir-conteudo')) {
            var id = `form-${e.target.id.split(".")[e.target.id.split(".").length - 1]}`;
            variaveisGlobais.controlarVisibilidade("exibir", `#${id}`);
            variaveisGlobais.controlarVisibilidade("exibir", "#localizar-conteudos-overlay");
        }
        if (e.target.classList.contains("retornar")) {
            e.preventDefault();
            variaveisGlobais.controlarVisibilidade("ocultar", `#form-${e.target.dataset.id}`);
            variaveisGlobais.controlarVisibilidade("ocultar", "#localizar-conteudos-overlay");
        }
    });
}


//carregando a página de edição de conteúdo
if (document.querySelector(".editar-conteudo")) {
    document.addEventListener("DOMContentLoaded", async function() {
        var input = document.querySelectorAll(".form-natureza input");
        
        var nome = document.getElementById("nome");
        var data = document.getElementById("data");
        var btnInserirArquivos = document.querySelector(`.btn-inserir-arquivos`);
        dadosBusca = {_id:link};

        //recuperando os dados do conteúdo selecionado
        await recuperarConteudo();
        for (let i = 0; i < input.length; i++) {
            if (input[i].defaultValue === conteudos.natureza) {
                input[i].checked = true;
            }
        }
        nome.value = conteudos._id;
        nome.classList.add('ineditavel');
        data.classList.add('ineditavel');
        document.getElementById("titulo").value = conteudos.titulo;
        document.getElementById("autor").value = conteudos.autor;
        document.getElementById("data").value = moment(conteudos.data).format("YYYY-MM-DD");

        if (conteudos.natureza === "video" || conteudos.natureza === "foto") {            
            document.getElementById("form-imagem").classList.add("hidden");
            document.querySelector(".id-midia").classList.remove("hidden");
            document.querySelector(".id-midia").innerHTML = divMidia;
            const subtipo = document.querySelectorAll(`input[name='subtipo']`);
            document.querySelector(".id-midia input").value = conteudos.midia;
            document.getElementById("diaDeExibicao").value = moment(conteudos.dataDeExibicao).format('YYYY-MM-DD');
            document.getElementById("horaDaExibicao").value = moment(conteudos.dataDeExibicao).add(3, 'hours').format('HH');
            document.getElementById("minutosDaExibicao").value = moment(conteudos.dataDeExibicao).format('mm');
            btnInserirArquivos.classList.add('hidden');
            btnInserirArquivos.previousElementSibling.classList.add('hidden');
            for (let i = 0; i < subtipo.length; i++) {
                if (subtipo[i].value === conteudos.subtipo) {
                    subtipo[i].checked = true;
                }
            }
        }
        if (conteudos.natureza === 'depoimento') {
            document.getElementById(`personagem`).value = conteudos.personagem;
            document.getElementById(`atuacao`).value = conteudos.atuacao;
        } else {
            variaveisGlobais.controlarVisibilidade('ocultar', '.form-personagem-nome');
            variaveisGlobais.controlarVisibilidade('ocultar', '.form-personagem-atuacao');
        }
        if (conteudos.tag.length !== 0) {
            document.getElementById("tags").value = conteudos.tag;
        } else {
            document.getElementById("tags").value = "";
        }
        if (conteudos.imagem === true) {
            document.getElementById("imagem").checked = true;
            variaveisGlobais.controlarVisibilidade("exibir", "#legenda-imagem");
            document.getElementById("legenda").value = conteudos.legenda;
        }
        if (conteudos.natureza === "noticia" || conteudos.natureza === "informe" || conteudos.natureza === "evento") {
            variaveisGlobais.controlarVisibilidade("exibir","#autor-conteudo");
            document.getElementById("autor").innerHTML = conteudos.autor;
        }

        //recuperando o texto no TinyMCE
        if (conteudos.texto) {            
            setTimeout(function() {
                tinymce.activeEditor.execCommand('mceInsertContent', false, conteudos.texto);
            }, 1500);
        }
    });
}

////// A executar após o carregamento da página
window.addEventListener("DOMContentLoaded", async function() {

    /////////////////////////////////////////////////////////////////////
    ////////////////// MANIPULAÇÃO FORM DE CONTEÚDOS //////////////////
    /////////////////////////////////////////////////////////////////////

    if (document.querySelector(".form-natureza")) {
        let trocarNatureza = (e, previo) => {            
            let mensagem = `<div>
                <h3>Os arquivos associados à antiga natureza serão apagados. Continuar?</h3>
                <div style="margin-bottom: 20px;" class="apagar-arquivos-button-div">
                    <button class='sim'>sim</button>
                    <button class='nao'>não</button>
                </div>
            </div>`
            variaveisGlobais.exibirMensagem(mensagem, null, "Atenção");
            
            document.querySelector(`.apagar-arquivos-button-div`).addEventListener('click', (evt) => {
                if (evt.target.classList.contains('sim')) {
                    e.target.previousElementSibling.checked = true;
                    eliminarDivArquivos();
                } else if (evt.target.classList.contains('nao')) {
                    variaveisGlobais.controlarVisibilidade('ocultar', '#mensagens-genericas', 400);
                }
            });
        };

        document.querySelector(".form-natureza").addEventListener("click", function(e) {
            e.preventDefault();
            let naturezaSelecionada;
            let temArquivos = document.querySelector('.arquivos-container').innerHTML;
            let naturezaOpcoes = document.querySelectorAll(`input[name='natureza']`);
            for (i = 0; i < naturezaOpcoes.length; i++) {
                if (naturezaOpcoes[i].checked) {
                    naturezaSelecionada = naturezaOpcoes[i]
                }
            }
            if (e.target.tagName === 'LABEL') {
                if (temArquivos && naturezaSelecionada !== undefined && e.target.previousElementSibling !== naturezaSelecionada) {
                    trocarNatureza(e, naturezaSelecionada);
                } else if (!temArquivos|| naturezaSelecionada === undefined) {
                    e.target.previousElementSibling.checked = true;
                }                
                manipularFormularioConteudos(e);            
            } 
        }, true);  

        //listener do nome do personagem em foco:    
        document.querySelector(".form-personagem-nome input").addEventListener('blur', (e) => {
            let nome = document.querySelector(`.form-personagem-nome input`).value;            
            document.querySelector('.form-nome input').value = nome;
            document.getElementById(`tipo-imagem-0`).value = definirNomeImagem(null, 0);
        });

        //listener do botão submit
        document.getElementById(`btn-submit`).addEventListener('click', (e) => {
            e.preventDefault();
            let dataPostagem; 
            //let nomeDoConteudo = textoCamelCase(document.getElementById(`nome`).value);
            let erroPreenchimento = variaveisGlobais.checarInputs(document.querySelectorAll("input[required], select[required], textarea[required]"));
            //tratamento do nome das imagens de corpo do texto (retiada das chaves, caso o usuário esqueça)            
            tratarNomeImagensCorpoTexto();
            
            if (!erroPreenchimento) {
                document.querySelector(`.formulario`).submit();
            }
        });

        //exibindo toda a interface de edição de conteúdos e omitindo a natureza
        if (!document.querySelector('form#inserir-conteudo')) {
            document.querySelector(`.form-natureza`).classList.add('hidden');
            variaveisGlobais.controlarVisibilidade('exibir', `.conteudos-container-dados`);
        } 

        
    }
    
    ////////////////////
    //gerando a página da equipe da Decania
    ///////////////////

    if (document.querySelector(".equipe-corpo")) {
        //recuperando a equipe via AJAX
        var equipe = await recuperarEquipe();

        //renderizando o DOM dinâmico, em função dos contatos
        montarEquipe(equipe);

        //listener para os carets que recolhem o setor
        document.getElementById("div-equipe").addEventListener("click", function(e){
            if (e.target.classList.contains("setores-header")) {
                exibirSetor(e);
            }
        }, true);

        //recolhendo ou expandindo todos os setores
        document.querySelector(".equipe-header").addEventListener("click", function(e) {
            if (e.target.classList.contains("recolher-todos")) {
                controlarExibicaoDiv("recolher", "setores", "up");
            } else if (e.target.classList.contains("expandir-todos")) {
                controlarExibicaoDiv("expandir", "setores", "up");
            }
        });
    }

    ////////////////////
    //gerando as páginas dos demais conteúdos
    ///////////////////

    if (!document.querySelector(".equipe-corpo") && !document.querySelector(".localizar-conteudos") && (document.querySelector(".conteudo") || document.querySelector(".editar-conteudo") )) {
        await recuperarConteudo();
       if(document.querySelector(".conteudo")) {
           await recuperarEquipe();
           exibirConteudo(conteudos);
       }        
        //adicionando os documentos da página
        if(conteudos.natureza !== 'depoimento' && conteudos.temDocumento) {
            rotinasDocumentos();           
        } 
    }

    ////////////////////////
    //////// EXIBINDO E OCULTANDO IDIOMAS - RELAÇÕES INTERNACIONAIS
    ////////////////////////

    if (document.getElementById("controls")) {
        document.getElementById("controls").addEventListener("click", function(e){
            if (e.target.classList.contains("idioma")){
                //ocultando o último item selecionado
                for (i = 0; i < document.querySelectorAll(".texto").length; i++) {
                    if (!document.querySelectorAll(".texto")[i].classList.contains("hidden") && e.target.id.substr(0,2) !== document.querySelectorAll(".texto")[i].id) {
                        variaveisGlobais.controlarVisibilidade("ocultar", `#${document.querySelectorAll(".texto")[i].id}`);
                        document.querySelectorAll(".idioma")[i].classList.remove("selecionado");
                        break;
                    }
                }
                //exibindo o item clicado
                if (document.getElementById(e.target.id.substr(0,2)).classList.contains("hidden")) {
                    variaveisGlobais.controlarVisibilidade("exibir", `#${e.target.id.substr(0,2)}`);
                    e.target.classList.add("selecionado");
                }

                //omitindo o título quando o idioma selecionado não é potuguês
                if (e.target.id !== "portugues") {
                    document.querySelector(".conteudo-titulo > h1").classList.add("opacidade-zero");
                } else {
                    document.querySelector(".conteudo-titulo > h1").classList.remove("opacidade-zero");
                }
            }
        });
    }

    /////////// LISTENERS PARA OS BOTÕES BACK - VOLTAR PARA A PÁGINA ANTERIOR SEM UMA NOVA REQUISIÇÃO HTTP
    if (document.querySelector(".voltar")) {
        document.querySelector(".voltar").addEventListener("click", function(e){
            window.history.back();
            setTimeout(function(){
                $('html, body').animate({ scrollTop: $('#barra-brasil' ).offset().top}, 'slow', function () {
                //callback para usar se eu quiser executar algo ao final do scroll
                });
            },600);
        });
    }

    //listener para o checkbox de imagem
    if(document.querySelector("#form-imagem input")) {
        document.querySelector("#form-imagem input").addEventListener("change", function(e) {
            if(e.target.checked) {
                variaveisGlobais.controlarVisibilidade("exibir", "#legenda-imagem");
            } else {
                variaveisGlobais.controlarVisibilidade("ocultar", "#legenda-imagem", 400);
            }
        });
    }

    //funções do organograma
    if (conteudos && conteudos._id === "organograma") {          
        document.querySelector(".conteudo-corpo").classList.add("grande");          
        document.querySelector(".texto-container").classList.add("grande");
    }

    //abertura dos divs da composiçao do Conselho de Centro:
    if (document.querySelector(".composicao-container")) {
        //adicionando as setas dos conteúdos        
        document.querySelector('.composicao-container .icon').innerHTML = `<i class='fa fa-caret-down'></i>`;
        document.querySelector('.efetivos .icon').innerHTML = `<i class='fa fa-caret-down'></i>`;
        document.querySelector('.convidados .icon').innerHTML = `<i class='fa fa-caret-down'></i>`;

        document.querySelector(".composicao-container").addEventListener('click', (e) => {
            if ((e.target.parentElement.classList.contains('composicao-container') || e.target.parentElement.classList.contains('composicao-menu')) && (e.target.tagName === 'H2' || e.target.classList.contains('titulo')) ) {
                e.target.parentElement.classList.toggle('aberto');
                variaveisGlobais.trocarSeta(e.target.previousElementSibling.firstElementChild);        
            }
        });
    }   

    //////// substituindo os thumbs do youtube por iframes
    var div, n,
        v = document.getElementsByClassName("youtube-player");
    for (n = 0; n < v.length; n++) {
        div = document.createElement("div");
        div.setAttribute("data-id", v[n].dataset.id);
        div.innerHTML = variaveisGlobais.labnolThumb(v[n].dataset.id);
        div.onclick = variaveisGlobais.labnolIframe;
        v[n].appendChild(div);
    }

    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v2.10";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

});
