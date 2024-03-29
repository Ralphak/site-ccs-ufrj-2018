var body = document.getElementsByTagName("body")[0],
    btnEstatisticas = document.getElementById("btn-estatisticas"),
    resumo,
    completas = [],
    osEditada = {},
    categoriasFuncionais = ["técnico", "estudante", "docente"],
    oficinas = ["Marcenaria", "Hidráulica", "Elétrica", "Refrigeração", "Pintura", "Obras", "Serralheria"],
    epi,//epi = [],    
    executor, encarregado, consideracoes, obs, descricao/* , epiInput */, 
    arrayUnidades = ['Centro Nacional de Biologia Estrutural e Bioimagem (CENABIO)', 'Escola de Educação Física e Desportos (EEFD)', 'Escola de Enfermagem Anna Nery (EEAN)', 'Faculdade de Farmácia (FF)','Faculdade de Medicina (FM)', 'Faculdade de Odontologia (FO)', 'Hospital Universitário Clementino Fraga Filho (HUCFF)', 'Instituto de Atenção Primária de Saúde São Francisco de Assis (HESFA)', 'Instituto de Biofísica Carlos Chagas Filho (IBCCF)', 'Instituto de Biologia (IB)', 'Instituto de Bioquímica Médica (IBqM)', 'Instituto de Ciências Biomédicas (ICB)', 'Instituto de Doenças do Tórax - (IDT)','Instituto de Estudos de Saúde Coletiva (IESC)', 'Instituto de Ginecologia (IG)', 'Instituto de Microbiologia Professor Paulo de Góes (IMPPG)', 'Instituto de Neurologia Deolindo Couto (INDC)', 'Instituto de Nutrição Josué de Castro (INJC)', 'Instituto de Pesquisa de Produtos Naturais (IPPN)', 'Instituto de Psiquiatria (IPUB)', 'Instituto de Puericultura e Pediatria Martagão Gesteira (IPPMG)', 'Instituto do Coração Edson Abdala Saad (ICES)', 'Maternidade Escola (ME)', 'Núcleo de Pesquisas Ecológicas de Macaé (NUPEM)', 'Núcleo de Tecnologia Educacional para a Saúde (NUTES)', 'Decania do CCS'];    
    unidadesAtendidas = ['Centro Nacional de Biologia Estrutural e Bioimagem (CENABIO)', 'Escola de Educação Física e Desportos (EEFD)', 'Faculdade de Farmácia (FF)','Faculdade de Medicina (FM)', 'Instituto de Biofísica Carlos Chagas Filho (IBCCF)', 'Instituto de Biologia (IB)', 'Instituto de Bioquímica Médica (IBqM)', 'Instituto de Ciências Biomédicas (ICB)', 'Instituto de Microbiologia Professor Paulo de Góes (IMPPG)', 'Instituto de Nutrição Josué de Castro (INJC)', 'Instituto de Pesquisa de Produtos Naturais (IPPN)', 'Decania do CCS'];

//recuperando as demandas via AJAX. Ao parâmetro "tipo" devem ser atribuídos os valores "resumo",  "completa" ou "estatísticas"
var recuperarDS = async function(tipo, id, ano, apenasConcluidas) {
    var demandas, estadoResumo
        subtipos = tipo.split("_");
    if (!id) {
        id = "";
    } if (!ano) {
        ano = new Date().getFullYear();
    }
    //mostrar as DS em aberto ou apenas as concluídas (resumo somente)
    if(apenasConcluidas){
        estadoResumo = { estado:{$nin: ["aberta", "em andamento"]} };
    } else{
        estadoResumo = { estado: ["aberta", "em andamento"] };
    }
    await $.ajax({type: 'GET',
        url: "/recuperarDs",
        data: {"tipo": tipo, "id": id, "ano": ano, "estadoResumo": estadoResumo},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            demandas = msg;
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
    return demandas;
};

//acao é deletar ou atualizar DS
var atualizarDS = async (dsId, acao) => {
    for (let i = 0; i < completas.length; i++) {
        if (completas[i]._id === dsId) {
            completas.splice(i, 1);
            //idDsEditada = msg.message;
        }
    }
    if (acao === 'atualizar') {
        let dsEditada = await recuperarDS("completa", dsId);
        completas.push(dsEditada);
    }
}

//eliminar ou arquivar demandas via AJAX. ID: id da demanda: ação 'arquivar' ou 'eliminar'.
var deletarDS = async function(id, acao) {
    await $.ajax({type: 'POST',
        url: "/manutencao/deletarDS",
        data: {"id": id, "acao": acao},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            variaveisGlobais.exibirMensagem(msg, 2000, null);
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });    
};

//editando ordens via AJAX. o parâmetro deve conter os dados atualizados da OS e informar se todas as ordens da demanda foram finalizadas
var editarOS = async function(obj) {    
    await $.ajax({type: 'POST',
        url: "/manutencao/editarOS",
        data: obj,
        dataType: "json"
    }).done(function ( msg ) {
        if (msg) {
            //atualizando a demanda
            atualizarDS(msg.message, "atualizar");            
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });    
};

//deletando ordens via AJAX.
var deletarOS = async function(idOS, idDS) {
    await $.ajax({type: 'POST',
        url: "/manutencao/deletarOS",
        data: {idOrdem: idOS, idDemanda: idDS},
        dataType: "json"
    }).done(function ( msg ) {
        if (msg) {
            //atualizando a demanda
            atualizarDS(msg.message, 'deletar');  
            variaveisGlobais.exibirMensagem(`<h2>Ordem de serviço excluída</h2>`, 2000, null);
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });    
};

//inserção de logs do administrador
var logAdm = async function(obj) {    
    await $.ajax({type: 'POST',        
        url: "/logAdm",
        data: obj,
        dataType: "json"
    }).done(function ( msg ) {
        if (msg) {
            //mensagem de confirmação
            variaveisGlobais.exibirMensagem(`<p>Sua mensagem:</p><p>"${obj.mensagem}"</p><p>foi inserida no histórico da DS</p>`, 4000, "Histórico da DS");
            setTimeout(() => {
                variaveisGlobais.controlarVisibilidade("ocultar", "#overlay", 500);
            }, 4000);
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });    
};

//selecionando unidades na criação de demandas
let autoComplete = (inputSelector, divItems, item, itemsArray) => {      
    document.querySelector(divItems).addEventListener('click', (evt) => {
        document.querySelector(inputSelector).value = evt.target.innerHTML;
    });
    document.querySelector(inputSelector).addEventListener('blur', (e) => {         
           
        let inputIsValid = false, atendida = false;
        for (let i = 0; i < itemsArray.length; i++) {
            if(itemsArray[i] === e.target.value) {
                inputIsValid = true;
                document.querySelector(`${divItems}`).innerHTML = '';
                break;
            }
        }
        setTimeout(() => {
            for (let i = 0; i < unidadesAtendidas.length; i++) {     
                if(unidadesAtendidas[i] === e.target.value) {         
                    atendida = true;
                    break;
                }
            }
            if (!atendida && e.target.value !== '') {
                variaveisGlobais.exibirMensagem('<p>Reiteramos que atendemos apenas demandas originadas no âmbito do Prédio do CCS.</p>', 3000);
            }
            
        }, 150);
        if(!inputIsValid) {
            e.target.value = '';
            setTimeout(() => {
                document.querySelector(`${divItems}`).innerHTML = ''; 
            }, 200);
        }
    });
    let validateInput = () => {
        document.querySelector(divItems).innerHTML = '';      
        for (let i = 0; i < itemsArray.length; i++) {                
            if (itemsArray[i].toUpperCase().includes(document.querySelector(inputSelector).value.toUpperCase())) { 
                document.querySelector(divItems).insertAdjacentHTML('beforeend', `<p class='${item}'>${itemsArray[i]}</p><br>`);            
            }                
        }  
    };
    let selectByKeys = (e) => {
        let items = document.querySelectorAll(`.${item}`),
            selectedItem;
        e.preventDefault();
        if(document.querySelector(inputSelector) === document.activeElement) {

            if(document.querySelector(`.${item}`) && e.keyCode === 13) {
                if(document.querySelector(`.selected`)) {
                    selectedItem = document.querySelector(`.selected`);
                } 
                selectedItem ? document.querySelector(`${inputSelector}`).value = selectedItem.innerHTML : document.querySelector(`${inputSelector}`).value = items[0].innerHTML; 
                document.querySelector(`${divItems}`).innerHTML = '';
            } else if (e.keyCode === 40) {    
                let selectedIndex;                  
                selectedItem = document.querySelector('.selected'); 
                if(!selectedItem && document.querySelector(`.${item}`)) {
                    items[0].classList.add('selected');
                }           
                selectedIndex = Array.from(items).indexOf(selectedItem);
                for (let i = 0; i < items.length; i++) {
                    items[i].classList.remove('selected');
                }
                if (selectedIndex + 1 === items.length) {
                    document.querySelectorAll(`.${item}`)[0].classList.add('selected');
                    selectedItem = document.querySelectorAll(`.${item}`)[0];    
                } else {
                    document.querySelectorAll(`.${item}`)[selectedIndex + 1].classList.add('selected');
                    selectedItem = document.querySelectorAll(`.${item}`)[selectedIndex + 1];
                }
                $(divItems).animate({ scrollTop: ($(selectedItem).offset().top - $(`${divItems} p`).offset().top) -50}, 'fast', function () {});
            } else if (e.keyCode === 38) {       
                let selectedIndex;     
                selectedItem = document.querySelector('.selected'); 
                if(!selectedItem && document.querySelector(`.${item}`)) {
                    items[0].classList.add('selected');
                    selectedIndex = 0;
                }           
                selectedIndex = Array.from(items).indexOf(selectedItem);
                for (let i = 0; i < items.length; i++) {
                    items[i].classList.remove('selected');
                }
                if (selectedIndex <= 0) {
                    document.querySelectorAll(`.${item}`)[document.querySelectorAll(`.${item}`).length - 1].classList.add('selected');
                    selectedItem = document.querySelectorAll(`.${item}`)[document.querySelectorAll(`.${item}`).length - 1];    
                } else {
                    document.querySelectorAll(`.${item}`)[selectedIndex - 1].classList.add('selected');
                    selectedItem = document.querySelectorAll(`.${item}`)[selectedIndex - 1];
                }
                $(divItems).animate({ scrollTop: ($(selectedItem).offset().top - $(`${divItems} p`).offset().top) -50}, 'fast', function () {});
            }        
        }
    };    
    document.querySelector(inputSelector).addEventListener('input', (e) => {
        if(document.querySelector(inputSelector).value.length >= 2) {
            validateInput();
        } else {
            document.querySelector(divItems).innerHTML = '';
        }        
    }); 
    //pressing a key (keyup, keydown or enter)
    window.addEventListener('keyup', (e) => {
        selectByKeys(e);        
    });
};

var ordenarPrioridade = (ds) => {    
    let dsCopy = ds.slice()
    let prioridades = [];
    for (let i = dsCopy.length - 1; i >= 0; i--) {
        if (dsCopy[i].prioridade) {
            prioridades.unshift(dsCopy[i]);
            dsCopy.splice(i, 1)
        }
    }
    return prioridades.concat(dsCopy);
}

var ordenarRecentesPrimeiro = (b,a) => {
    b = dataTimeStamp(b._id.toString().substring(0,8), null);
    a = dataTimeStamp(a._id.toString().substring(0,8), null);
    if (a < b) {
        return -1;
    } else if (a > b) {
        return 1;
    } else {
        return 0;
    }
};

var ordenarAntigasPrimeiro = (b,a) => {
    b = dataTimeStamp(b._id.toString().substring(0,8), null);
    a = dataTimeStamp(a._id.toString().substring(0,8), null);
    if (a > b) {
        return -1;
    } else if (a < b) {
        return 1;
    } else {
        return 0;
    }
};

//insere o cabeçalho relativo ao grupo de demandas selecionadas no DIV de filtro
let cabecalhoDS = (ano) => {
    let cabecalho;
    ano === 'emAndamento' ? cabecalho = `<h2 class='demandas-cabecalho'>Demandas em curso</h2>` : cabecalho = `<h2 class='demandas-cabecalho'>Demandas concluídas em ${ano}</h2>`;      
    if (document.querySelector('.demandas-cabecalho')) {
        document.querySelector(`.demandas-cabecalho`).outerHTML = '';
        document.querySelector(`.lista-ds`).insertAdjacentHTML('beforebegin', cabecalho);
    } else {
        document.querySelector(`.lista-ds`).insertAdjacentHTML('beforebegin', cabecalho);
    }
}

//atualiza os cards de demandas
var resumoDsDOM = function(ds) {
    let apagarDS;
    //determinando as datas de cada Ds, a partir dos Ids no MongoDB
    for(let i = 0; i < ds.length; i++){
        ds[i].data = dataTimeStamp(ds[i]._id.toString().substring(0,8), `DD [de] MMMM [de] YYYY`);
    }
    
    if (window.localStorage.getItem("filtro") === "recentesPrimeiro") {        
        ds.sort(ordenarRecentesPrimeiro);
    } else if (window.localStorage.getItem("filtro") === "antigasPrimeiro") {        
        ds.sort(ordenarAntigasPrimeiro);
    } if (window.localStorage.getItem('filtroPrioridades') === 'true') {
        ds = ordenarPrioridade(ds);
    }

    var resumos = "";
    document.querySelector(".lista-ds").innerHTML = "";
    for(let i = 0; i < ds.length; i++) {
        var prioridade;

        if (ds[i].prioridade === true) {
            prioridade = `<i class="fa fa-exclamation-triangle"></i>`
        } else {
            prioridade = ""
        }
        ds[i].estado !== 'aberta' && ds[i].estado !== 'em andamento' ? apagarDS = '' : apagarDS = `<i class='fa fa-trash deletar-ds'></i>`
         
        resumos += `
            <div class="ds card" id="${ds[i]._id}">
                <div class="ds-header">
                    <div class="prioridade">${prioridade}</div>
                    <i class="fa fa-cogs"></i>
                    <span class="span-manutencao">Manutenção</span>
                    <span class="span-ds">DS</span>
                </div>
                <div class="card-descricao">${ds[i].identificacao}</div>
                <div class="card-data">${ds[i].data}</div>

                <div class="card-solicitante">Solicitante: ${ds[i].solicitante}</div>
                <div class="card-estado">Estado da DS: ${ds[i].estado}</div>
                <div class="detalhes-plus">
                    <i class="fa fa-plus"></i>
                    <span>detalhes</span>
                </div>
                ${apagarDS}
            </div>
        `;
    }
    document.querySelector(".lista-ds").insertAdjacentHTML("beforeend", resumos);
};

var resumoDemanda = function(ds) {
    var prioridade;    
    ds.prioridade ? prioridade = "alta" : prioridade = "normal";    
    return `<div class='dados-gerais-demanda'>
        <p class='ds-solicitante col-lg'> <strong> Solicitante:</strong> ${ds.solicitante}</p>
        <p class='ds-matricula col-sm'> <strong> Matrícula:</strong> ${ds.matricula}</p>
        <p class='ds-categoria col-md'> <strong> Categoria:</strong> ${ds.categoria}</p>
        <p class='ds-cargo col-lg'> <strong> Cargo/Função:</strong> ${ds.cargo}</p>
        <p class='ds-telefone col-sm'> <strong> Telefone:</strong> ${ds.telefone}</p>
        <p class='ds-email col-md'> <strong> E-mail:</strong> ${ds.email}</p>
        <p class='ds-local col-lg'> <strong> Local para contato:</strong> ${ds.localTrabalho}</p>
        <p class='ds-local col-lg'> <strong> Local do serviço:</strong> ${ds.local}</p>
        <p class='ds-horarios col-sm'> <strong> Horários:</strong> ${ds.horarios}</p>
        <p class='ds-unidade col-md'> <strong> Unidade:</strong> ${ds.unidade}</p>
        <div class='detalhamento-demanda'>
            <p> <strong> Descrição:</strong> ${ds.descricao}</p>
            <p> <strong> Observações:</strong> ${ds.obs}</p>                
        </div>
        <p class='display-only'> <strong> Estado:</strong> ${ds.estado}</p>
        <p class='display-only'> <strong> Prioridade:</strong> ${prioridade}</p>
    </div>`
};

var dsEventosDOM = function(eventos){
    var eventosDOM = "";
    for (let i = 0; i < eventos.length; i++) {
        eventosDOM += `
            <div class="evento-ds">
                <p>${moment(eventos[i].data).format("DD/MM/YYYY[ - ]HH:mm[h]")} | </p><strong>${eventos[i].texto}</strong>
            </div>
        `;
    }
    return eventosDOM;
};

var localizarOsDs = (idOS) => {
    let os, ds;
    var achou = false;
    for (let i = 0; i < completas.length; i++) {
        for (let j = 0; j < completas[i].os.length; j++) {
            if (completas[i].os[j]._id === idOS) {
                os = completas[i].os[j];
                ds = completas[i];
                achou = true;
                break;
            }
        }
        if (achou) break;
    }
    return {ds, os}
};

//atualiza o div de demanda
var dsCompletaDOM = function(ds) {
    document.getElementById("detalhes-demanda").innerHTML = "";
    let eventos = dsEventosDOM(ds.eventos),
        os = "",
        osPrint = "",
        fotos = "",
        imagensDiv="",
        hidden,
        apagarOS; 
    ds.estado !== "aberta" && ds.estado !== "em andamento" ? hidden = "hidden opacidade-zero" : hidden = "";

    for (let i = 0; i < ds.os.length; i++) {
        ds.os[i].dataFinalizacao ? apagarOS = '' : apagarOS = `<i id='deletar_ordem_${ds.os[i]._id}' data-demanda='${ds._id}' class="fa fa-trash deletar-os "></i>`
        os += `
        <div class="os card display-only" id="${ds.os[i]._id}">
            <div class="os-header">
                <div class="span-oficina">${ds.os[i].oficina}</div>
                <i class="fa fa-cogs"></i>
                <span class="span-os">OS</span>
            </div>
            <div class="card-os-id">${ds.os[i]._id}</div>
            <div class="card-data">aberta em: ${moment(ds.os[i].dataAbertura).format("DD/MM/YYYY")}</div>
            <div class="os-descricao">${ds.os[i].descricao.substr(0,75)}...</div>
            <div class="os-estado">
            
            </div>
            ${apagarOS}
            <div class="os-data-finalizacao"></div>
        </div>`;
        osPrint += `<div class='os-print'>

            <div class="ds-os-print-id">
                <p>ID: ${ds.os[i]._id}</p>
            </div>
            <div class="ds-os-print-oficina">
                <p>Oficina: ${ds.os[i].oficina}</p>
            </div> 
            <div class="ds-os-print-encarregado">
                <p>Encarregado: ${ds.os[i].encarregado}</p>
            </div>
        </div>`;
    }
    if (ds.fotos) {
        for (let i = 0; i < ds.fotos.length; i++) {
            imagensDiv = `
            <div class="demanda-fotos">
            <h2><strong>Imagens</strong></h2>
            </div>`;
            fotos += `
            <img class="imagens-ds" src="/img/manutencao/${ds.fotos[i]}">
            `;
        }
    }
    
    var detalhes = `
        <div class="manutencao-detalhes-ds janela hidden opacidade-zero" id="detalhes-${ds._id}">
            <div class="cabecalho">
                <h2 class="header screen">Detalhamento da demanda:</h2>
                <h2 class="header print">Oficinas de manutenção predial<br><span>Demanda de Serviço ${ds._id}<br>Data de abertura: ${dataTimeStamp(ds._id.toString().substring(0,8), `DD MMM YYYY`)} </span></h2>
            </div>
            <div class="ds-comando-div display-only">
                <div class="button-editar btn-acao ${hidden}"><a href="/manutencao/editar/DS/${ds._id}">
                    <i class="fa fa-pencil" aria-hidden="true"></i>
                    <span>editar DS</span></a>
                </div>
                <div class="button-imprimir btn-acao button-imprimir-ds">
                    <i class="fa fa-print" aria-hidden="true"></i>
                    <span>imprimir DS</span>
                </div>
            </div>
            <div class="div-dados-gerais">
                <h2><strong>Dados gerais da demanda</strong></h2>
                ${resumoDemanda(ds)}
            </div>
            <div class="detalhes-os-${ds._id}">
                <h2><strong> Ordens de Serviço</strong></h2>
                <a href="/manutencao/novaOS/${ds._id}">
                    <div class="display-only btn-acao button-nova ${hidden}">
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        <span>nova OS</span>
                    </div>
                </a>
                <div class="div-lista-os card-container">
                    <div class="lista-os card-div">
                    </div>
                </div>
                <div class="print lista-os-print"></div>
            </div>
            <div class='display-only'>
                ${imagensDiv}
            </div>
            <div class="display-only detalhes-eventos-${ds._id}">
            <h2><strong>Eventos</strong></h2>
            <div class="btn-acao btn-novo-log-gerente display-only ${hidden}"><span>inserir mensagem</span></div>
            <div class="overlay-novo-log-gerente hidden opacidade-zero display-only">
                <div class="div-novo-log-gerente  formulario ">
                    <span class="fechar-janela">X</span>
                    <h2>Escolha uma das mensagens abaixo ou insira uma mensagem personalizada:</h2>
                    <div>
                        <input type="radio" class="input-novo-log-gerente" name="msg" id="material-requerente" value="Aguardando material, a ser fornecido pelo requerente">
                        <label for="material-requerente"><span></span>Aguardando material, a ser fornecido pelo requerente</label>
                
                    </div>
                    <div>
                        <input type="radio" class="input-novo-log-gerente" name="msg" id="material-decania" value="Aguardando material, a ser fornecido pela Decania do CCS">
                        <label for="material-decania"><span></span>Aguardando material, a ser fornecido pela Decania do CCS</label>            
                    </div>
                    <div>
                        <label for="messagem-customizada">
                            <p>mensagem customizada</p>
                        </label>
                        <br>
                        <input type="text" class="input-novo-log-gerente" name="mensagem-customizada" id="mensagem-customizada">
                    </div>
                    <div>
                        <button class="submit-novo-log-gerente">enviar mensagem</button>
                    </div>
                </div>
            </div>
                <div class="lista-eventos">
                </div>
            </div>
            <div class='finalizacao-demanda print'>
                <h2>Finalização da demanda</h2>
                <div class='ds-status'>
                    <p>Status da demanda:</p>
                    <div class='ds-status-opcoes'>
                        <span><div class="check"></div>Atendida integralmente</span>
                        <span><div class="check"></div>Atendida Parcialmente</span>
                        <span><div class="check"></div>Não atendida </span>
                    </div>
                </div>
                <div class='ds-consideracoes'>
                    <p class='label'>considerações finais</p>
                    <div></div>
                </div>
                <div class='ds-responsavel'>
                    <p class='label'>responsável pela finalização</p>
                    <div></div>
                </div>
            </div>
            <div class="button-div display-only">
                <button id="button-fechar-detalhes" class=" button-fechar">voltar</button>
            </div>
        </div>
    `;

    document.getElementById("detalhes-demanda").insertAdjacentHTML("beforeend", detalhes);
    document.getElementById("detalhes-demanda").insertAdjacentHTML("beforeend", `<div class="janela manutencao-editar-os hidden opacidade-zero"></div>`);
    document.querySelector(".lista-eventos").insertAdjacentHTML("beforeend", eventos);
    document.querySelector(".lista-os").insertAdjacentHTML("beforeend", os);
    document.querySelector(".lista-os-print").insertAdjacentHTML("beforeend", osPrint);
    document.querySelector(".lista-os").insertAdjacentHTML("beforeend", `<div class="card placeholder-div"></div>`);
    if (imagensDiv) {
        document.querySelector(".demanda-fotos").insertAdjacentHTML("beforeend",`<div>${fotos}</div>` );
    }
    //atualizando o estado de cada OS
    for (let i = 0; i < document.querySelectorAll(".card.os").length; i++) {
        atualizaEstadoOs(ds.os[i]);
    }

    
    //abrir o div de mensagens no histórico da DS
    document.querySelector(".btn-novo-log-gerente").addEventListener("click", () => {
        variaveisGlobais.controlarVisibilidade("exibir", ".overlay-novo-log-gerente");
    });
    //funções do registro de mensagens no log de eventos
    document.querySelector(".overlay-novo-log-gerente").addEventListener("click", async (e) => {
        //TODO: apenas de o div não estiver oculto (overlay)
        if (e.target.classList.contains("fechar-janela")) {
            variaveisGlobais.controlarVisibilidade("ocultar", ".overlay-novo-log-gerente", 500);
        }
        else if (e.target.id === "mensagem-customizada") {            
            document.getElementById(`material-decania`).checked = false;
            document.getElementById(`material-requerente`).checked = false;
        }
        else if (e.target.type === "radio") {
            document.getElementById(`mensagem-customizada`).value = "";
        } else if (e.target.classList.contains("submit-novo-log-gerente")) {            
            let inputs = document.querySelectorAll(".input-novo-log-gerente");
            let encontrou = false
            for (let i = 0; i < inputs.length; i++) {                
                if ((inputs[i].type === "radio" && inputs[i].checked) || (inputs[i].type === "text" && inputs[i].value !== "" && inputs[i].value !== undefined)) {
                    variaveisGlobais.controlarVisibilidade("ocultar", ".div-novo-log-gerente", 500);
                    variaveisGlobais.exibirMensagem(`<h2>Salvando sua mensagem...</h2><br> <img src='/img/loading.svg'>`, 20000 ,"Histórico da DS");
                    variaveisGlobais.controlarVisibilidade("ocultar", ".overlay-novo-log-gerente", 500);
                    let nomeGerente = document.querySelector(".mensagens-login").innerHTML.split(" ").pop();
                    nomeGerente = nomeGerente.slice(0, nomeGerente.length-1);
                    await logAdm({mensagem: `${nomeGerente}: ` + inputs[i].value, id: ds._id});
                    atualizarDS(ds._id, 'atualizar');                     
                    if (inputs[i].type === "radio") {
                        inputs[i].checked = false;
                    } else {
                        inputs[i].value = "";
                    }
                    encontrou = true;
                    break;
                } 
            } 
            if (encontrou) {
                dsCompletaDOM(ds);
            } else {
                variaveisGlobais.exibirMensagem(`<h2>Selecione uma mensagem padrão ou escreva sua mensagem personalizada</h2>`, 3000 ,"Histórico da DS");
            }
        }
    });
};

//insere itens de formulários (radio buttons ou checkboxes) no div. nome: o nome pelo qual o botão será identificado no servidor | tipo: "radio" ou "checkbox" | array - a lista com todos os itens a serem elencados | seletor - o seletor do elemento no qual o botão será inserido | Posição - de acordo com insertadjacentHTML
var inserirCamposSelecao = function(nome, tipo, array, seletor, posicao) {
    var html = "";
    for (let i = 0; i < array.length; i++) {
        html+= `<div>
            <input type=${tipo} name="${nome}" id="${nome}${i}" value="${array[i]}">
            <label for="${nome}${i}"><span></span>${array[i]}</label>
        </div>`;
    }
    document.querySelector(seletor).insertAdjacentHTML(posicao, html)
};

var inserirMateriais = function() {
    let total = document.querySelectorAll(".input-material-div").length,
    material;    

    material = `
    <div class="input-material-div">
        <div class="input-material">
            <label for="nomeMaterial${total}">material</label>
            <input type="text" name="matNome[]" id="nomeMaterial${total}">
        </div>
        <div class="input-material">
            <label for="qtdMaterial${total}">quant</label>
            <input type="number" name="matQuant[]" id="qtdMaterial${total}" value="1" min="1">
        </div>        
        <i class="fa fa-times-circle"></i>
    </div>`;
    document.querySelector(".os-materiais").insertAdjacentHTML("afterbegin", material);
    document.getElementById(`nomeMaterial${total}`).focus();
};

var recuperarMateriais = function (nome, quant) {
    //buscar materias já existentes
    let materiaisExistentesDOM = ``;
    for(let i = 0; i < os.matNome.length; i++) {
        materiaisExistentesDOM += `
        <div class="input-material-div">
            <div class="input-material">
                <label for="nomeMaterial${i}">material</label>
                <input type="text" name="matNome[]" id="nomeMaterial${i}" value="${nome[i]}">
            </div>
            <div class="input-material">
                <label for="qtdMaterial${i}">quant</label>
                <input type="number" name="matQuant[]" id="qtdMaterial${i}" value="${quant[i]}">
            </div>        
            <i class="fa fa-times-circle display-only"></i>
        </div>`;
    }
    materiaisExistentesDOM +=`
    <div class="input-material-div placeholder">   
        <div class="input-material">
            <label>material</label>
            <input type="text" name="matNome[]" value="">
        </div>
        <div class="input-material">
            <label>quant</label>
            <input type="number" name="matQuant[]" value=0>           
        </div>
    </div>
    <div class="input-material-div placeholder">   
        <div class="input-material">
            <label>material</label>
            <input type="text" name="matNome[]" value="">
        </div>
        <div class="input-material">
            <label>quant</label>
            <input type="number" name="matQuant[]" value=0>           
        </div>
    </div>`;
    document.querySelector(".os-materiais").insertAdjacentHTML("beforeend", materiaisExistentesDOM);
};

var marcarCheckbox = function(DOMArray, objectArray ) {
    for (let i = 0; i < DOMArray.length; i++) {
        for (let j = 0; j < objectArray.length; j++) {
            if (DOMArray[i].value === objectArray[j]) {
                DOMArray[i].checked = true;
                break;
            }
        }
    }
};

var atualizaEstadoOs = function(os) {
    var estado, icon, finalizacao;
    if(os.executada === undefined || os.executada === "neutro" ) {
        estado = "em andamento";
        icon = `<i class="fa fa-wrench"></i>`
    } else if(os.executada === false){
        estado = "não realizado";
        icon = `<i class="fa fa-times-circle"></i>`
    } else if (os.executada === true) {
        estado = "serviço concluído em ";
        icon = `<i class="fa fa-check-circle"></i>`
    }
    if(os.dataFinalizacao === undefined || os.executada === false) {
        finalizacao = "";
    } else {
        finalizacao = moment(os.dataFinalizacao).format("DD-MM-YYYY");
    }
    document.querySelector(`#${os._id} .os-estado`).innerHTML = `${estado}${finalizacao}${icon}`;
    //document.querySelector(`#${os._id} .os-data-finalizacao`).innerHTML = `${os.dataFinalizacao}`;
};

var dataTimeStamp = function(codigo, formato) {
    return moment(new Date( parseInt( codigo, 16 ) * 1000 )).format(formato);
};

//inserção de campos dinâmicos no DOM
var camposDinamicosOs = function(){
    //inserirCamposSelecao("epi[]", "checkbox", epi, ".os-epi", "beforeend");
    inserirCamposSelecao("oficina", "radio", oficinas, ".os-oficinas", "beforeend");
    if (!document.querySelector(".manutencao-abrir-os")) {
        recuperarMateriais(os.matNome, os.matQuant);
    }

    //adicionar ou retirar materiais
    document.querySelector(".os-materiais-container").addEventListener("click", function(e){
        if(e.target.classList.contains("btn-inserir-materiais")){
            inserirMateriais();
        } else if(e.target.classList.contains("fa-times-circle")){
            e.target.parentElement.remove();
        }
    });
};

//gerar estatísticas para cada mês
var estatisticasDOM = async function(){
    var dadosDS = await recuperarDS("estatisticas"),
    dadosOS = [],
    estados = ["aberta", "em andamento", "atendida", "atendida parcialmente", "não atendida", "fora de escopo"],
    osFinalizadas = 0, osFalhas = 0, html, unidades = [], unidadesContabilizadas, chamadosPorUnidade = '';
    //salvar as OS em um vetor diferente
    for(let i=0; i<dadosDS.length; i++){
        for(let j=0; j<dadosDS[i].os.length; j++){
            dadosOS.push(dadosDS[i].os[j]);
        }
    }
    //contagem das OS finalizadas
    for(let i=0; i<dadosOS.length; i++){
        if(dadosOS[i].executada){ //a entrada existe e tem valor true
            osFinalizadas++;
        } else if(dadosOS[i].executada == false){ //a entrada existe e tem valor false
            osFalhas++;
        }
    }
    //contabilização das unidades
    for (let i = 0; i < dadosDS.length; i++) {
        unidades.push(dadosDS[i].unidade);            
    }    
    unidadesContabilizadas = unidades.reduce((unidades, unidade) => {
        unidade in unidades ? unidades[unidade]++ : unidades[unidade] = 1
        return unidades;
    }, {});    
    for (let i = 0; i < Object.keys(unidadesContabilizadas).length; i++) {
        chamadosPorUnidade += `<li>${[Object.keys(unidadesContabilizadas)[i]]}: <strong>${unidadesContabilizadas[Object.keys(unidadesContabilizadas)[i]]}</strong></li>`  ;        
    }
    html = `
        <p><strong>Chamados recebidos</strong><br>
        Total: ${dadosDS.length}<br>
        <p><strong>Chamados por Unidade</strong></p>
        <div class=chamados-por-unidade><ul>${chamadosPorUnidade}</ul></div>
        <p><strong>Demandas por estado</strong><br>
        ${contagemArray(estados, dadosDS, "estado")}</p>
        <p><strong>Categorias</strong><br>
        ${contagemArray(categoriasFuncionais, dadosDS, "categoria")}</p>
        <p><strong>Ordens de Serviço</strong><br>
        Criadas: ${dadosOS.length}<br>
        Finalizadas: ${osFinalizadas}<br>
        Não realizadas: ${osFalhas}</p>
        <p><strong>Oficinas</strong><br>
        ${contagemArray(oficinas, dadosOS, "oficina")}</p>
        `;
    document.querySelector(".estatisticas-container").innerHTML = html;
};

//função para contagem de atributos em uma coleção de dados, a partir de um vetor
var contagemArray = function(array, colecao, propriedade){
    let html = ``;
    for(let i=0; i<array.length; i++){
        let contador = 0;
        for(let j=0; j<colecao.length; j++){  
            if(colecao[j][propriedade] && colecao[j][propriedade] === array[i]){      
                contador++;
            }
        }
        html += `${array[i]}: ${contador}<br>`;
    }
    return html;
};

let buscarDemandas = () => {
    let input = document.querySelector(`.filtrar-demandas--input`);   
    let cards = document.querySelectorAll('.card'); 
    let filtradas = [];
    //selecionando ID´s de demandas que apresentam as palavras-chave
    for (let i = 0; i < resumo.length; i++) {
        if (input.value === resumo[i]._id) {
            filtradas.push(resumo[i]._id);
            break;
        } else if (resumo[i].identificacao.toUpperCase().includes(input.value.toUpperCase())) {
            filtradas.push(resumo[i]._id);
        } else if (resumo[i].solicitante.toUpperCase().includes(input.value.toUpperCase())) {
            filtradas.push(resumo[i]._id);
        }  else if (resumo[i].estado.toUpperCase().includes(input.value.toUpperCase())) {
            filtradas.push(resumo[i]._id);
        }       
    }
    //reexibindo as demandas ora ocultas
    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove('hidden');        
    }
    //ocultando demandas que não corespondem à pesquisa
    for (let i = 0; i < cards.length; i++) {
        if (!filtradas.includes(cards[i].id)) {
            cards[i].classList.add('hidden');
        }
        
    }
};
//bloco de execuções:
document.addEventListener("DOMContentLoaded", async function() {
    if (document.querySelector(".manutencao-gerenciador")) {
        //caregando o resumo das demandas para exibição no DOMContentLoaded
        resumo = await recuperarDS("resumo");
        //inserindo os resumos na estrutura do DOMContentLoaded
        if (window.localStorage.getItem("filtro") === 'antigasPrimeiro' ) {
            document.getElementById(`radio1`).checked = true;
        } else if (window.localStorage.getItem("filtro") === 'recentesPrimeiro' ) {
            document.getElementById(`radio2`).checked = true;
        }        
        if (window.localStorage.getItem("filtroPrioridades") === 'true') {
            document.getElementById(`checkbox1`).checked = true;
        } else {
            document.getElementById(`checkbox1`).checked = false;
        }

        resumoDsDOM(resumo);

        //Gerar o HTML do filtro por ano da lista de DS
        var ano = new Date().getFullYear(),
        filtroAno = `<option value="emAndamento">Em andamento</option>`;
        for(let a=ano; a>ano-5; a--){
            filtroAno += `<option value="${a}">Concluídas em ${a}</option>`;
        }
        document.getElementById("filtro-ano-ds").insertAdjacentHTML("beforeend", filtroAno);

        //listeners
        
        //keypresses na página
        document.addEventListener('keyup', (e) => {
            if (e.keyCode === 13 && document.querySelector(`.filtrar-demandas--input`) === document.activeElement) {
                buscarDemandas();
            }
            if(e.keyCode === 27 && document.querySelector(`.filtrar-demandas--input`) === document.activeElement) {
                document.querySelector(`.filtrar-demandas--input`).value = '';
                buscarDemandas();
            }
        });

        //listener div de busca
        document.querySelector(`.filtrar-demandas`).addEventListener(`click`, function(e){
            if (e.target === document.querySelector(`.filtrar-demandas--btn`)) {
                buscarDemandas();
            } else if(e.target === document.querySelector('.limpar-busca')) {
                document.querySelector(`.filtrar-demandas--input`).value = '';
                buscarDemandas();
            }
       });

        //verificar se um DS já está no array de completas. Imprime a DS em caso afirmativo, ou recupera e imprime, em caso negativo.
        document.querySelector(".lista-ds").addEventListener("click", async function(e){
            if (e.target.classList.contains("ds")){
                var jaExiste = false;
                var index;
                for (let i = 0; i < completas.length; i++) {
                    if (e.target.id === completas[i]._id) {
                        jaExiste = true;
                        index = i;
                        break
                    }
                }
                if (jaExiste) {
                    dsCompletaDOM(completas[index]);
                } else {
                    var dsCompleta = await recuperarDS("completa", e.target.id);
                    if(!dsCompleta){
                        dsCompleta = await recuperarDS("completaConcluidas", e.target.id);
                    }
                    completas.push(dsCompleta);
                    dsCompletaDOM(dsCompleta);
                }
                variaveisGlobais.controlarVisibilidade("exibir", "#overlay");
                variaveisGlobais.controlarVisibilidade("exibir", "#detalhes-" + e.target.id);
                body.classList.add("fixo");
            }
        });
        
        
        document.getElementById("filtro-ano-ds").addEventListener("change", async function(e){
                let ano = document.getElementById("filtro-ano-ds").value,
                anoAtual = new Date().getFullYear();
                cabecalhoDS(ano);
                if(ano == "emAndamento"){
                    resumo = await recuperarDS("resumo");
                }else if(ano == anoAtual){
                    resumo = await recuperarDS("resumo","",anoAtual,true);
                } else{
                    resumo = await recuperarDS("resumoConcluidas","",ano);
                }
                resumoDsDOM(resumo);
        });

        document.querySelector(`.filtro-ordenacao-ds`).addEventListener("click", (e) => {
            if(e.target.id == "checkbox1" && e.target.checked){
                window.localStorage.setItem("filtroPrioridades", 'true');
                resumoDsDOM(resumo);
            } else if (e.target.id == "checkbox1" && !e.target.checked) {
                window.localStorage.setItem("filtroPrioridades", 'false');
                resumoDsDOM(resumo);
            } else if (e.target.type === "radio") {
                window.localStorage.setItem("filtro", e.target.value);
                resumoDsDOM(resumo);
            }
        });            

        
        document.getElementById("div-demandas").addEventListener("click", function(e) {
            if (e.target.id === "button-fechar-detalhes") {
                variaveisGlobais.controlarVisibilidade("ocultar", `#${e.target.parentElement.parentElement.id}`);
                variaveisGlobais.controlarVisibilidade("ocultar", "#overlay");
                body.classList.remove("fixo");
            } else if (e.target.id === "btn-fechar-os-editar") {
                osEditada = {}, os = {};
                variaveisGlobais.controlarVisibilidade("ocultar",".manutencao-editar-os");
            }            
            if (e.target.classList.contains("button-imprimir")) {
                if (e.target.classList.contains("button-imprimir-os")) {
                    document.querySelector('.manutencao-detalhes-ds').classList.add("display-only");
                    document.getElementsByTagName("title")[0].innerHTML = document.querySelectorAll("h2.header span")[1].innerHTML.split("<br>")[0];
                    print();
                    document.getElementsByTagName("title")[0].innerHTML = "Chamados de manutenção | CCS-UFRJ";
                    document.querySelector('.manutencao-detalhes-ds').classList.remove("display-only");
                } else if (e.target.classList.contains("button-imprimir-visita")) { 
                    document.getElementsByTagName("title")[0].innerHTML = document.querySelectorAll("h2.header span")[1].innerHTML.split("<br>")[0];
                    document.querySelector('.manutencao-detalhes-ds').classList.add("display-only");
                    document.querySelector(`.os-materiais-container`).classList.add(`display-only`);
                    document.querySelector(`.os-epi`).classList.add(`display-only`);
                    document.querySelector(`.os-descricao-div`).classList.add(`visita`);
                    document.querySelector(`.os-obs`).classList.add(`visita`);
                    document.querySelector(`.visita-preliminar`).classList.add(`visita`);
                    document.querySelector(`.vistos-visita`).classList.add(`visita`);
                    document.querySelector(`.finalizacao-super-div`).classList.add(`display-only`);
                    document.querySelector(`.finalizacao-super-div`).classList.add(`visita`);
                    print();
                    document.getElementsByTagName("title")[0].innerHTML = "Chamados de manutenção | CCS-UFRJ";
                    document.querySelector('.manutencao-detalhes-ds').classList.remove("display-only");
                    document.querySelector(`.os-materiais-container`).classList.remove(`display-only`);
                    document.querySelector(`.os-epi`).classList.remove(`display-only`);
                    document.querySelector(`.os-descricao-div`).classList.remove(`visita`);
                    document.querySelector(`.os-obs`).classList.remove(`visita`);
                    document.querySelector(`.visita-preliminar`).classList.remove(`visita`);
                    document.querySelector(`.vistos-visita`).classList.remove(`visita`);
                    document.querySelector(`.finalizacao-super-div`).classList.remove(`display-only`);
                    document.querySelector(`.finalizacao-super-div`).classList.remove(`visita`);
                } else if (e.target.classList.contains("button-imprimir-ds")) {                    
                    document.querySelector('.manutencao-editar-os').classList.add("display-only");                    
                    document.getElementsByTagName("title")[0].innerHTML = document.querySelectorAll("h2.header span")[0].innerHTML.split("<br>")[0];
                    print();
                    document.getElementsByTagName("title")[0].innerHTML = "Chamados de manutenção | CCS-UFRJ";
                    document.querySelector('.manutencao-editar-os').classList.remove("display-only");  
                }
            }
            //deletando demandas fora de escopo ou arquivando demandas que não podem ser atendidas
            if(e.target.classList.contains('deletar-ds')) {
                let msg = `
                <div id='excluir-demanda-div'>
                    <h2>A demanda será apagada/arquivada. Determinar o motivo:</h2>
                    <div id="div-btn-apagar-demanda">                        
                        <button class="excluir-demanda criada-indevidamente">criada indevidamente</button>
                        <button class="excluir-demanda fora-de-escopo">fora de escopo</button>                   
                    </div>

                    <div class="button-div display-only">
                        <button class="button-fechar" style='position:unset;'>voltar</button>
                    </div>
                </div>`;
                variaveisGlobais.exibirMensagem(msg, null);
                document.getElementById(`excluir-demanda-div`).addEventListener(`click`, async (evt) => {
                    if (evt.target.classList.contains('button-fechar')) {
                        variaveisGlobais.controlarVisibilidade('ocultar', `#mensagens-genericas`);
                    } else if (evt.target.classList.contains('criada-indevidamente')) {
                        document.getElementById(`excluir-demanda-div`).innerHTML = `<img src='/img/loading.svg'>`;
                        await deletarDS(e.target.parentElement.id, 'eliminar');
                        await atualizarDS(e.target.parentElement.id, 'deletar');
                        let resumo = await recuperarDS('resumo');
                        resumoDsDOM(resumo);
                    } else if (evt.target.classList.contains('fora-de-escopo')) {
                        document.getElementById(`excluir-demanda-div`).innerHTML = `<img src='/img/loading.svg'>`;
                        await deletarDS(e.target.parentElement.id, 'arquivar');
                        await atualizarDS(e.target.parentElement.id, 'atualizar');
                        let resumo = await recuperarDS('resumo');
                        resumoDsDOM(resumo);
                    }
                });
            }
        });

        //controle de abertura do div de estatísticas
        document.getElementById("btn-estatisticas").addEventListener("click", function(e) {
            document.getElementById("div-estatisticas").classList.toggle("aberto");
            if(document.getElementById("div-estatisticas").classList.contains("aberto")){
                estatisticasDOM();
            }
            body.classList.toggle("fixo");
        });

        //funções diversas do div de demanda completa
        document.getElementById("detalhes-demanda").addEventListener("click", async function(e) {
            //exibindo e ocultando imagens
            if (e.target.classList.contains("imagens-ds")) {
                e.target.classList.toggle("exibir-full");
            }

            //edição de OS
            if (e.target.classList.contains("card") && e.target.classList.contains("os") ) {
                variaveisGlobais.controlarVisibilidade("exibir", ".manutencao-editar-os");                
                os = localizarOsDs(e.target.id).os;
                ds = localizarOsDs(e.target.id).ds;

                var editarOsHeader, readOnly, hidden;
                if (os.executada === "neutro" || os.executada === undefined) {
                    editarOsHeader = `<h2 class='screen'>Edite a ordem de serviço, preenchendo os campos abaixo:</h2>`;
                    readOnly = "";
                    hidden = "";

                } else {
                    editarOsHeader = `<h2 class="screen">Ordem de serviço ${os._id} finalizada</h2>`;
                    readOnly = "readonly";
                    hidden = "hidden";
                }                
                var form = `
                <div class="outerDiv ${readOnly}">
                    <div class="cabecalho cabecalho-os print">                        
                        <h2 class="header print">Oficinas de manutenção predial<br><span>Ordem de Serviço ${os._id}<br>Data de abertura: ${moment(os.dataAbertura).format("DD MMM YYYY")}<br>Oficina: ${os.oficina}<br>Encarregado: ${os.encarregado} </span></h2>
                    </div>
                    <h2 class="header display-only">Edição/Finalização de OS</h2>
                    <div class="os-imprimir-div display-only">                        
                        <div class="btn-acao button-imprimir button-imprimir-visita">
                            <i class="fa fa-print" aria-hidden="true"></i>
                            <span>visita</span>
                        </div>
                        <div class="btn-acao button-imprimir button-imprimir-os">
                            <i class="fa fa-print" aria-hidden="true"></i>
                            <span>imprimir OS</span>
                        </div>
                    </div>
                    <h2 class="print subtitle os-dados-demanda-print">Dados da Demanda</h2>
                    ${editarOsHeader}
                    <div class="print">
                        ${resumoDemanda(ds)}
                    </div>
                    <div class="formulario ${readOnly}" id="form-os">
                        <div class="hidden">
                            <input type="text" name="idOS" id="idOS" value="${os._id}">
                        </div>
                        <div class="os-oficinas display-only">
                            <label for="oficina">
                                <p>Oficina:</p>
                            </label>
                        </div>
                        <div class="os-encarregado display-only">
                            <label for="encarregado"><p>Encarregado:</p></label>
                            <input type="text" name="encarregado" id="encarregado" >
                        </div>
                        <h2 class="print visita-preliminar">Visita preliminar</h2>
                        <div class="os-descricao-div">
                            <label class="label-os" for="descricao"><p>Descrição do problema:</p></label>
                            <textarea class="display-only" name="descricao" id="descricao" required></textarea><br>
                            <div class="print"><p>${os.descricao}</p></div>
                        </div>
                        <div id="os-obs" class="os-obs">
                            <label class="label-os" for="obs"><p>Observações:</p></label>
                            <textarea class="display-only" name="obs" id="obs"></textarea><br>
                            <div class="print"><p>${os.obs}</p></div>
                        </div>
                        <div class="os-materiais-container"">
                            <label class="label-os" for="materiais">
                                <p>Materiais:</p>
                            </label>
                            <div class="btn-acao btn-inserir-materiais display-only">
                                <i class="fa fa-plus-circle" aria-hidden="true"></i>
                                <span>inserir material</span>
                            </div>
                            <div class="os-materiais"></div>
                        </div>
                        <div class="os-epi">
                            <label class="label-os" for="epi"><p>EPIs:</p></label>
                            <textarea class="display-only" name="epi" id="epi"></textarea><br>
                            <div class="print"><p>${os.epi}</p></div>
                        </div>                        
                        <h2 class="centralizado os-finalizacao display-only">Finalização da Ordem de Serviço</h2>
                        <div class="block finalizacao-super-div">
                            <h2 class="print subtitle finalizacao-titulo">Finalização da Ordem de Serviço</h2>
                            <div class="os-finalizacao-div">
                                <div class="os-finalizacao-container">
                                    <label class="label-os" for="executada"><p>Serviço realizado?</p></label><br>
                                    <select class="display-only" name="executada" id="executada">
                                        <option disabled value="neutro">Selecione uma opção:</option>
                                        <option value=true>sim</option>
                                        <option value=false>não</option>
                                    </select>
                                    <div class="print executadaSN">
                                        <div>
                                            <div class="check"></div><span>Sim</span> 
                                        </div>
                                        <div>
                                            <div class="check"></div><span>Não</span> 
                                        </div>
                                    </div>
                                </div>
                                <div class="os-dataFinalizacao">
                                    <label class="label-os" for="dataFinalizacao"><p>Data de Finalização da Ordem:</p></label>
                                    <input class="display-only" type="date" name="dataFinalizacao" id="dataFinalizacao">
                                    <div class="print input-print"></div>
                                </div>
                                <div class="os-executor">
                                    <label class="label-os" for="executor"><p>executor:</p></label>
                                    <input class="display-only" type="text" name="executor" id="executor">
                                    <div class="print input-print"></div>
                                </div>                        
                                <div class="os-consideracoes-finais">
                                    <label class="label-os" for="consideracoes"><p>Considerações finais:</p></label>
                                    <textarea class="display-only" name="consideracoes" id="consideracoes" ></textarea><br>
                                    <div class="print input-print big"></div>
                                </div>
                            </div>                        
                            <div class="print os-vistos-div">
                                <label><p>Vistos:</p></label>
                                <div class="vistos">
                                    <div>
                                        <label>Solicitante</label>
                                    </div>
                                    <div>
                                        <label>Emissor</label>
                                    </div>
                                    <div>
                                        <label>Executante</label>
                                    </div>
                                    <div>
                                        <label>Encarregado</label>
                                    </div>
                                    
                                </div>  
                            </div>
                        </div>
                        <div class="print vistos-visita os-vistos-div">
                        <label><p>Vistos:</p></label>
                        <div class="vistos">
                            <div>
                                <label>Solicitante</label>
                            </div>                            
                            <div>
                                <label>Executante</label>
                            </div>
                            <div>
                                <label>Encarregado</label>
                            </div>                            
                        </div>  
                    </div>
                        <div class="display-only">
                            <button id="btn-submit" class="botao-submit ${hidden}">Editar</button>
                        </div>
                    </div>
                    <button id="btn-fechar-os-editar" class="button-fechar display-only">voltar</button>
                </div>
                `;
                //atribuindo ID à OS
                document.querySelector(".manutencao-editar-os").innerHTML = form;

                //gerando as listas de oficinas, EPIs e materiais (adição/remoção) dinamicamente
                camposDinamicosOs();
                epi = document.getElementById("epi");

                //declarando variáveis do DOM atualizado
                executor = document.getElementById("executor");
                encarregado = document.getElementById("encarregado");
                consideracoes = document.getElementById("consideracoes");
                obs = document.getElementById("obs");
                descricao = document.getElementById("descricao");
                dataFinalizacao = document.getElementById("dataFinalizacao");

                //selecionando a oficina da OS
                var oficinasInput = document.querySelectorAll("input[name='oficina']");
                for (let i = 0; i < oficinasInput.length; i++) {
                    oficinasInput[i].value === os.oficina ? oficinasInput[i].checked = true : oficinasInput[i].checked = false;
                }
                
                //adicionando ao DOM o nome do encarregado
                encarregado.value = os.encarregado;
                //selecionando EPIs
                epi.value = os.epi;
                /* epiInput =  document.querySelectorAll("input[name='epi[]']");
                marcarCheckbox(epiInput, os.epi); */

                if(os.executada === undefined) {
                    os.executada = "neutro";
                }
                descricao.value = os.descricao;
                dataFinalizacao.value = os.dataFinalizacao;
                os.obs ? obs.value = os.obs : obs.value = "";
                document.querySelector(`#executada option[value="${os.executada}"]`).selected = true;
                os.executor ? executor.value = os.executor : executor.value = "";
                os.consideracoes ? consideracoes.value = os.consideracoes : consideracoes.value = "";
            }

            if (e.target.id === "btn-submit") {
                //recolhendo os novos valores, após o salvamento da OS
                osEditada._id = os._id;
                osEditada.idDemanda = ds._id;
                osEditada.encarregado = encarregado.value;
                osEditada.matNome = [];
                osEditada.matQuant = [];
                for (let i = 0; i < document.querySelectorAll(".input-material-div").length; i++) {
                    if (document.querySelectorAll(`input[name="matNome[]"]`)[i].value !== "" && Number(document.querySelectorAll(`input[name="matQuant[]"]`)[i].value) > 0) {
                        osEditada.matNome.push(document.querySelectorAll(`input[name="matNome[]"]`)[i].value);
                        osEditada.matQuant.push(Number(document.querySelectorAll(`input[name="matQuant[]"]`)[i].value));
                    }
                }
                osEditada.epi = epi.value;
                /* osEditada.epi = [];
                for (let i = 0; i < epiInput.length; i++) {
                    if (epiInput[i].checked === true) {
                        osEditada.epi.push(epiInput[i].value);
                    }
                } */
                osEditada.descricao = descricao.value;
                osEditada.obs = obs.value;
                for (i = 0; i < document.querySelectorAll("#executada option").length; i++) {
                    if (document.querySelectorAll("#executada option")[i].selected === true) {
                        if (document.querySelectorAll("#executada option")[i].value === "neutro") {
                            osEditada.executada = "neutro";
                        } else if (document.querySelectorAll("#executada option")[i].value === "true") {
                            osEditada.executada = true;
                        } else {
                            osEditada.executada = false;
                        }
                        break;
                    }
                }
                if (dataFinalizacao.value !== "") {
                    osEditada.dataFinalizacao = moment(dataFinalizacao.value).toDate();
                }
                osEditada.executor = executor.value;
                osEditada.consideracoes = consideracoes.value;

                //checar se todas as ordens da demanda foram finalizadas:
                for (let i = 0; i < ds.os.length; i++) {
                    osEditada.dsFinalizada = true;
                    if ( ds.os[i]._id === osEditada._id) {
                        continue;
                    }
                    if ((ds.os[i].executada === "neutro" || ds.os[i].executada === undefined || osEditada.executada === "neutro" || osEditada.executada === undefined)) {
                        osEditada.dsFinalizada = false;
                        break;
                    }
                }

                //verificando o status definitivo da ordem finalizada, se todas as ordens foram finalizadas
                if (osEditada.dsFinalizada) {
                    var todas = true, alguma = true, nenhuma = true;
                    for (let i = 0; i < ds.os.length; i++) {
                        if ( ds.os[i]._id === osEditada._id) {
                            if (ds.os.length === 1 && osEditada.executada === false ) {
                                todas = false;
                                alguma = false
                            } else if (ds.os.length === 1) {
                                nenhuma = false;
                                alguma = false
                            }
                            continue;
                        }
                        if((ds.os[i].executada === false || ds.os[i].executada === "neutro") || osEditada.executada === false) {
                            todas = false;
                        }
                        if(ds.os[i].executada === true || osEditada.executada === true) {
                            nenhuma = false;
                        }
                        if (todas || nenhuma) {
                            alguma = false;
                        }
                    }
                    if (todas) {
                        osEditada.dsEstado = "atendida";
                    } else if (nenhuma) {
                        osEditada.dsEstado = "não atendida";
                    } else {
                        osEditada.dsEstado = "atendida parcialmente";
                    }
                }

                //validando o formulário e enviando os dados via ajax
                if (moment(osEditada.dataFinalizacao).isBefore(moment(os.dataAbertura).hour(0).minutes(0).seconds(0).milliseconds(0)) || moment(new Date()).isBefore(moment(osEditada.dataFinalizacao))) {
                    variaveisGlobais.exibirMensagem("A data de finalização deve ser posterior à data de abertura da OS e anterior ao dia de hoje", 4000, "Data incorreta");
                } else if ((osEditada.executada !== "neutro" && osEditada.executada !== undefined)  && (!osEditada.executor || !osEditada.encarregado || !osEditada.descricao || osEditada.dataFinalizacao === undefined)){

                    variaveisGlobais.exibirMensagem("Para finalizar esta ordem de serviço, é necessário informar o nome do encarregado pela oficina, a descrição do problema, a data de finalização e o nome do executor do serviço", 4000, "Dados ausentes");
                } else if ((osEditada.executada === "neutro" || osEditada.executada === undefined) && (osEditada.executor || (osEditada.dataFinalizacao !== "" && osEditada.dataFinalizacao !== undefined))) {
                    variaveisGlobais.exibirMensagem("Para gravar o nome do executor e registrar as considerações finais, é necessário informar se a ordem de serviço foi finalizada", 4000);
                } else if ((osEditada.executada === "neutro" && !osEditada.executor && !osEditada.consideracoes && (!osEditada.dataFinalizacao || osEditada.dataFinalizacao === "")) || (osEditada.executada !== "neutro" && osEditada.encarregado && osEditada.descricao && (osEditada.executor || osEditada.dataFinalizacao !== ""))) {
                    //ajax post aqui para rota que altera a OS e informa se finalizou a DS                    
                    await editarOS(osEditada);
                    //atualizando o estado da OS:
                    var refreshResumoDemandas = await recuperarDS("resumo");
                    //atualizando o estado de todas as demandas:
                    resumoDsDOM(refreshResumoDemandas);
                    dsCompletaDOM(ds);
                    variaveisGlobais.exibirMensagem("<h3>Salvamento concluído</h3>", 2000);
                    setTimeout(function() {
                        variaveisGlobais.controlarVisibilidade("ocultar",".manutencao-editar-os");
                        body.classList.remove("fixo");
                        if (osEditada.dataFinalizacao !== "") {
                            variaveisGlobais.controlarVisibilidade("ocultar","#overlay");
                        }
                    }, 2000);
                }
            }

            //deletar OS
            if (e.target.classList.contains('deletar-os')) {
                let os, ds;
                os = localizarOsDs(e.target.id.split('_').pop()).os;
                ds = localizarOsDs(e.target.id.split('_').pop()).ds;
                let msg = `
                <div id='excluir-ordem-div'>
                    <h2>A ordem será apagada/arquivada. Continuar?</h2>
                    <div id="div-btn-apagar-demanda">                        
                        <button class="excluir-ordem">sim</button>                                        
                    </div>
                    <div class="button-div display-only">
                        <button class="button-fechar" style='position:unset;'>voltar</button>
                    </div>
                </div>`;
                variaveisGlobais.exibirMensagem(msg, null);
                document.getElementById(`excluir-ordem-div`).addEventListener(`click`, async (evt) => {
                    if (evt.target.classList.contains('button-fechar')) {
                        variaveisGlobais.controlarVisibilidade('ocultar', `#mensagens-genericas`);
                    } else if (evt.target.classList.contains('excluir-ordem')) {
                        document.getElementById(`excluir-ordem-div`).innerHTML = `<img src='/img/loading.svg'>`;
                        await deletarOS(e.target.id.split('_').pop(), e.target.dataset.demanda);                          
                        let resumo = await recuperarDS("resumo");
                        resumoDsDOM(resumo);                         
                        dsCompletaDOM(ds);
                        body.classList.remove("fixo");
                    } 
                });
            }
        });

        //eventos de scroll:
        document.addEventListener("scroll", function(){
            if (document.querySelector(".footer").getBoundingClientRect().top > window.innerHeight) {
                btnEstatisticas.style.bottom = "10px";
                btnEstatisticas.style.top = "unset";
            } else {
                btnEstatisticas.style.top = document.querySelector(".footer").getBoundingClientRect().top - 130 + "px";
                btnEstatisticas.style.bottom = "unset";
            }
        });       

    } else if (document.querySelector(".manutencao-editar-ds")){
        var id = window.location.href.split("/").pop(),
            ds = await recuperarDS("completa", id);
        document.getElementById("identificacao").value = ds.identificacao;
        document.getElementById("solicitante").value = ds.solicitante;
        document.getElementById("matricula").value = ds.matricula;
        inserirCamposSelecao("categoria", "radio", categoriasFuncionais, ".ds-categoria", "beforeend");
        var categorias = document.querySelectorAll("input[name='categoria']");
        for(let i = 0; i < categorias.length; i++) {
            categorias[i].value === ds.categoria ? categorias[i].checked = true : categorias[i].checked = false;
        }
        document.getElementById("id").value = ds._id;
        document.getElementById("identificacao").value = ds.identificacao;
        document.getElementById("unidade").value = ds.unidade;
        document.getElementById("cargo").value = ds.cargo;
        document.getElementById("local").value = ds.local;
        document.getElementById("telefone").value = ds.telefone;
        document.getElementById("email").value = ds.email;
        document.getElementById("horarios-disponiveis-manutencao").value = ds.horarios;
        document.getElementById("descricao").value = ds.descricao;
        document.getElementById("obs").value = ds.obs;
        document.querySelector(`#prioridade option[value="${ds.prioridade}"]`).selected = true;

    } else if (document.querySelector(".manutencao-abrir-ds")) {
        let faltaPreencher;
        inserirCamposSelecao("categoria", "radio", categoriasFuncionais, ".ds-categoria", "beforeend");
        //marcar como obrigatório o preenchimento da categoria
        document.getElementById(`categoria0`).required = true;
        //seleção dinâmica de unidade
        autoComplete('#unidade', '.div-unidades', 'unidade', arrayUnidades); 
        //enviando a demanda
        document.getElementById(`btn-submit`).addEventListener(`click`, function(e){    
            //condicional para não realizar a validação quando o input selecionado está ativo, porque o enter deve selecionar o primeiro elemento da lista, e não enviar o formulário
            if(document.querySelector(`#unidade`) !== document.activeElement) {
                faltaPreencher = variaveisGlobais.checarInputs(document.querySelectorAll("#form-ds input[required], #form-ds textarea[required]")); 
            }        
        });

        $(`#form-ds`).submit(function(e){
            e.preventDefault(); 
            if (!faltaPreencher && !variaveisGlobais.disabled && document.querySelector(`#unidade`) !== document.activeElement) {                
                variaveisGlobais.clickingOnce();                
                this.submit();
            }             
        });    
    } else if (document.querySelector(".manutencao-abrir-os")) {        
        document.querySelector(`.os-materiais-container`).classList.add('hidden');
        document.querySelector(`.os-epi`).classList.add('hidden');
        camposDinamicosOs();  

        $(`#form-os`).submit(function(e){
            e.preventDefault();            
            if (!variaveisGlobais.disabled) {                
                variaveisGlobais.clickingOnce();                
                this.submit();
            }             
        });
    } else if(document.querySelector(".manutencao-acompanhar")){
        var id = window.location.href.split("/").pop(),
            ds = await recuperarDS("completa", id),
            eventos = dsEventosDOM(ds.eventos),
            listaEventos = document.querySelector(".lista-eventos");
        listaEventos.insertAdjacentHTML("beforeend", eventos);
        document.querySelector(`.btn-ds-enviar-mensagem`).addEventListener(`click`, async function(e){
            e.preventDefault();
            await logAdm({mensagem: `${ds.solicitante.split(' ').shift()}: ${document.querySelector(".ds-enviar-mensagem").value}`, id: ds._id});
            listaEventos.innerHTML = "";
            document.querySelector(`.ds-enviar-mensagem`).value = '';            
            ds = await recuperarDS("completa", id);
            eventos = dsEventosDOM(ds.eventos);
            listaEventos.insertAdjacentHTML("beforeend", eventos);
        });
    }
    //facultando a escolha do upload de imagens apenas, no formulário de geração da DS
    if (document.querySelector('.btn-inserir-arquivos')) {
        document.querySelector('.btn-inserir-arquivos').addEventListener('click', (e) => {
            setTimeout(() => {                
                document.querySelectorAll(`.tipo-arquivo`)[0].classList.add('hidden');
                document.querySelectorAll(`option[value='imagem']`)[0].selected = true; 
            }, 2);
        });
    }
});