////////////////////////
//////// EXIBINDO ARQUIVOS ANEXADOS EM FORMULÁRIOS
////////////////////////

let removerArquivos, tamanhoArquivos = 0;

var anexos = function(e, anexo, funcao) {
    var method1, method2;
    if (funcao === "inserir") {
        method1 = "add"; method2 = "remove";
            info = `anexado o arquivo: ${e.target.value.split("\\")[2]}`;
    } else {
        e.preventDefault();
        method1 = "remove"; method2 = "add"; info = "";
    }
    document.querySelector(`#label-${anexo}`).classList[method1]("remover-arquivo");
    document.querySelector(`.texto-${anexo}`).innerHTML = info;
    document.querySelector(`#label-${anexo} i`).classList[method2]("fa-upload");
    document.querySelector(`#label-${anexo} i`).classList[method1]("fa-times");
    document.querySelector(`#label-${anexo} i`).classList[method1](`remover-${anexo}`);
};

const isImage = e => {
    const ext = e.target.value.split('.').pop();
    return (ext === 'jpg' || ext === 'jpeg' || ext === 'png');
}

var inputAnexosListener = (e) => {
    let idArquivo = e.target.id.split('-')[e.target.id.split('-').length - 1]; 
    const isImg = isImage(e); 
    const tipoAnexo = validarImagens(e);
    if(document.querySelector(`#label-anexo-${idArquivo} i`).classList.contains("fa-upload") && e.target.files[0].size < 1024 * 1024 && tamanhoArquivos + e.target.files[0].size < 5 * 1024 * 1024) {  
        if (tipoAnexo === 'imagem' && isImg || tipoAnexo !== 'imagem') {
            tamanhoArquivos += e.target.files[0].size
            anexos(e, `anexo-${idArquivo}`, "inserir");
            console.log("aumentou tamanho: ", tamanhoArquivos);                                
            document.getElementById(`tipo-arquivo-${idArquivo}`).classList.add('readonly');
        } else if (tipoAnexo === 'imagem' && !isImg) {
            variaveisGlobais.exibirMensagem ("<h3>As imagens devem estar codificadas nos formatos JPEG ou PNG</h3>", 3500);
            e.target.value = '';
        }
    } else if (e.target.files[0] && (e.target.files[0].size > 1024 * 1024 || tamanhoArquivos + e.target.files[0].size > 5 * 1024 * 1024) && isImg) {
        variaveisGlobais.exibirMensagem ("Cada arquivo deve ter tamanho inferior a 1MB e o total de arquivos anexados não pode ultrapassar 5MB", 3500);
        console.log('ultrapassou tamanho! Tamanho geral dos arquivos: >>>> ', tamanhoArquivos);
        e.target.value = "";        
    } 
};

var removerAnexosListener = (e) => {
    if (document.getElementById(`anexo-${e.target.dataset.ref.split('-')[e.target.dataset.ref.split('-').length - 1]}`).value !== "") {
        tamanhoArquivos -= document.getElementById(`anexo-${e.target.dataset.ref.split('-')[e.target.dataset.ref.split('-').length - 1]}`).files[0].size;
        console.log("diminuiu tamanho: ", tamanhoArquivos);
    }
};

var removerArquivosListener = (e) => {
    if (e.target.classList.contains("remover-arquivo")) {
        let idArquivo = e.target.id.split('-')[e.target.id.split('-').length - 1];
        tamanhoArquivos -= document.getElementById(`anexo-${idArquivo}`).files[0].size;
        document.getElementById(`anexo-${idArquivo}`).value = "";
        document.getElementById(`tipo-arquivo-${idArquivo}`).classList.remove('readonly');
        e.preventDefault();
        anexos(e, `anexo-${idArquivo}`, "remover");
        console.log("diminuiu tamanho: ", tamanhoArquivos);
    }
};

let controlarExibicaoCamposImagem = (id) => {
    let disposicao = document.getElementById(`disposicao-imagem-${id}`);
    if (document.getElementById(`radio6`) && !document.getElementById(`radio6`).checked) {
            disposicao.classList.remove('hidden');
            disposicao.previousElementSibling.classList.remove('hidden');
    } else {
        disposicao.classList.add('hidden');
        disposicao.previousElementSibling.classList.add('hidden');
    }       
};

//define o nome do arquivo de imagem de conteúdos
let definirNomeImagem = (e, id) => {
    let nomeDoArquivo = document.getElementById(`nome-imagem-${id}`);
    let nomeDoConteudo;     
    document.querySelector('.editar-conteudo') ? nomeDoConteudo = document.getElementById(`nome`).value : nomeDoConteudo = textoCamelCase(document.getElementById(`nome`).value);
    
    let dataDePostagem;
    if (document.getElementById(`data`).value === '') {
        if (document.querySelector(`.editar-conteudo`)) {
            dataDePostagem = '';
        } else {
            dataDePostagem = moment(new Date()).format('YYYY-MM-DD[-]');
        }
    } else {
        if (document.querySelector(`.editar-conteudo`)) {
            dataDePostagem = '';
        } else {
            dataDePostagem = `${document.getElementById(`data`).value}-`;
        }

    }
    if (document.getElementById(`radio6`).checked) {
        nomeDoArquivo.value = `depoimento_${dataDePostagem}${nomeDoConteudo}.jpg`;
        nomeDoArquivo.classList.add('ineditavel');
    } else if (e.target.value !== 'corpo') {
        nomeDoArquivo.value = `${dataDePostagem}${nomeDoConteudo}${e.target.value}.jpg`;
        nomeDoArquivo.classList.add('ineditavel');
    } else {
        nomeDoArquivo.value = `${dataDePostagem}${nomeDoConteudo}{ordem}.jpg`;
        nomeDoArquivo.classList.remove('ineditavel');
    }
};

let validarImagens = e => {
    let id = e.target.id.split('-')[e.target.id.split('-').length - 1];
    if (!e.target.classList.contains('remover-arquivo') ) {
        if (document.getElementById(`tipo-arquivo-${id}`).value === '') {
           e.preventDefault();
           variaveisGlobais.exibirMensagem('<h3>Você deve escolher o tipo de arquivo antes de selecionar o anexo</h3>', 3000, 'Atenção!')
        } else {
            return document.getElementById(`tipo-arquivo-${id}`).value;
        }
    }
};

var inserirContainerDados = (container, id, blocos) => {
    let bloco, tipoImagensEvent = false, tipoSessaoEvent = false, disposicaoImagensEvent = false;
    if (container === 'imagem') {
        bloco = blocos.naturezaImagem;
    } else if (container === 'ata') {
        bloco = blocos.dadosAtas;
    } else {
        bloco = blocos.nomeAmigavel;
    }
    containersDadosArquivos = document.querySelectorAll(`#file-upload-arquivo-${id} .container-dados-arquivo`);
    for (let i = 0; i < containersDadosArquivos.length; i++) {
        containersDadosArquivos[i].outerHTML = '';                            
    }
    document.getElementById(`arquivo-dados-${id}`).insertAdjacentHTML('beforeend', bloco);    
    
    let disposicaoImagens = document.querySelectorAll("select[name='disposicaoImagem']");
    if (container === 'imagem') {        
        //controlando a exibição dos campos, de acordo com a natureza da imagem de conteúdo:
        controlarExibicaoCamposImagem(id);      
        
        //definindo o nome da imagem, se for imagem de depoimentos
        if (document.getElementById(`radio6`) && document.getElementById(`radio6`).checked) {
            definirNomeImagem(null, id); 
        }
           
        if (!disposicaoImagensEvent) {
            disposicaoImagens[0].addEventListener('change', (e) => {      
                definirNomeImagem(e, id);          
            });
            disposicaoImagensEvent = true;
        }
    } 
    
    let tipoSessao = document.querySelectorAll("select[name='tipoSessao']");
    if (container === 'ata') {
        if (!tipoSessaoEvent) {
            tipoSessao[0].addEventListener('change', (e) => {    
            });
            tipoSessaoEvent = true;
        }
    }

    //apagando os links do container, se o documento é diferente de diversos
    if (container !== 'diversos' && document.getElementById(`link-anexo-${id}`)) {
        document.getElementById(`link-anexo-${id}`).outerHTML = '';
    }
};

let inserirArquivos = () => {
    let arquivoDados = `
        <div id="file-upload-arquivo-${id}" class="file-upload file-upload-arquivos"> 
            <span class='fechar-janela' data-ref="file-upload-arquivo-${id}">X</span>              
            <div class="arquivo-dados" id="arquivo-dados-${id}">
                <div class="tipo-arquivo">
                    <p>Tipo do documento:</p>
                    <select name="tipoArquivo" id="tipo-arquivo-${id}" required>
                        <option disabled selected value="">Selecione o tipo de documento:</option>
                        <option value="ata">ata</option>
                        <option value="diversos">diversos</option>                       
                        <option value="imagem">Imagens de conteúdos (notícias, personagem em foco, fotos usuários)</option>                       
                    </select>  
                </div>
            </div>                
            <label>
                <p>Arquivo:</p>
                <i class="fa fa-info"></i>
                <span class="dica">Clique no botão de upload abaixo para selecionar o arquivo</span>
            </label>
            <div class="anexo">
                <div class="texto texto-anexo-${id}"></div>
                <label class="label-upload" for="anexo-${id}" id="label-anexo-${id}">
                    <i class="fa fa-upload"></i><span class="span-anexar">Anexar Arquivo</span>
                </label>
                <input type="file" name="anexo" id="anexo-${id}" class="anexo" required>
            </div> 
            <i class='fa fa-check anexo-ok'></i>
        </div>
    `;
    document.querySelector('.arquivos-container').insertAdjacentHTML('afterbegin', arquivoDados);
    //setTimeout necessário para popular o formulário com o primeiro arquivo
    setTimeout(() => {            
        let inputAnexos = document.querySelectorAll("input[name='anexo']"),
        removerArquivos = document.querySelectorAll(".label-upload"),
        removerAnexos = document.querySelectorAll(".fechar-janela"),
        tipoArquivos = document.querySelectorAll("select[name='tipoArquivo']"),       
        tipoArquivosEvent = false, removerArquivosEvent = false, removerAnexosEvent = false, inputAnexosEvent = false;
        let natureza;   
        if (document.getElementById(`radio6`)) {
            document.getElementById(`radio6`).checked ? natureza = 'depoimentos' : natureza = 'conteudos';
        }  

        let naturezaImagem = `
            <div class="tipo-imagem container-dados-arquivo">
                <p class='hidden'>Natureza da imagem:</p>
                <input name="tipoImagem" id="tipo-imagem-${id}" class='hidden' required value='${natureza}'> 
                <p class='hidden'>Disposição da imagem:</p>
                <select name="disposicaoImagem" id="disposicao-imagem-${id}" class='hidden'>
                    <option disabled selected value="">Selecione uma opção:</option>
                    <option value="">principal</option>
                    <option value="Sm">card</option>
                    <option value="XSm">resultados de busca</option>
                    <option value="Md">destaque (banner)</option>            
                    <option value="Sq">destaque (quadrada)</option>            
                    <option value="corpo">corpo do texto</option>            
                </select>                
                <label class='label-nome-arquivo-${id}' for="nome-imagem-${id}">
                    <p>Nome do arquivo:</p>
                    <i class="fa fa-info"></i>
                    <span class="dica">Nome do arquivo, igual ao nome da página com a extensão .jpg no final (YYYY-MM-DD-tituloDoConteudo.jpg)</span>
                </label>
                <input class='input-nome-arquivo-${id} ineditavel' type="text" name="nomeImagem" id="nome-imagem-${id}" required>
            </div>`;
        let nomeAmigavel = `
            <div class="container-dados-arquivo">
                <label for="nome-amigavel-${id}">
                    <p>Nome do arquivo:</p>
                    <i class="fa fa-info"></i>
                    <span class="dica">Nome a ser exibido na página</span>
                </label>
                <input type="text" name="nomeAmigavel" id="nome-amigavel-${id}" required>
            </div>   
            <span id='link-anexo-${id}' class='link-anexo'></span>         
        `;
        let dadosAtas = `
            <div class="dados-atas container-dados-arquivo">
            <div>
                <label for="data-natureza-${id}">
                    <p>Natureza da sessão:</p>
                    <i class="fa fa-info"></i>
                    <span class="dica">Informar se a sseão foi ordinária ou extraordinária</span>
                </label>
                <select name="tipoSessao" id="tipo-sessao-${id}" required>
                    <option disabled selected value="">Selecione uma opção:</option>
                    <option value="ordinaria">Ordinária</option>
                    <option value="extraordinaria">Extraordinária</option>                             
                </select>                
            </div>
                <div>
                    <label for="data-sessao-${id}">
                        <p>Data da Sessão:</p>
                        <i class="fa fa-info"></i>
                        <span class="dica">O dia no qual ocorreu a reunião</span>
                    </label>
                    <input type="date" name="dataSessao" id="data-sessao-${id}" required>
                </div>
                <div>
                    <label for="numeroSessao-${id}">
                        <p>Número da Sessão:</p>
                        <i class="fa fa-info"></i>
                        <span class="dica">O número sequencial que consta na ata</span>
                    </label>
                    <input type="number" name="numeroSessao" id="numero-sessao-${id}" required>
                </div>
            </div>
        `;           
        for (let i = 0; i < inputAnexos.length; i++) {
            if (!inputAnexosEvent) {
                inputAnexos[i].addEventListener("change", function(e) {
                    inputAnexosListener(e);
                });
                inputAnexosEvent = true;
            }
            if (!removerAnexosEvent) {
                removerAnexos[i].addEventListener('click', (e) => { 
                    removerAnexosListener(e);
                });
                removerAnexosEvent = true;
            }
            if (!removerArquivosEvent) {
                removerArquivos[i].addEventListener('click', (e) => {
                    validarImagens(e);
                    removerArquivosListener(e);
                });
                removerArquivosEvent = true;
            }                
            if (!tipoArquivosEvent) {
                tipoArquivos[0].addEventListener('change', (e) => { 
                    let idContainer = e.target.id.split('-')[e.target.id.split('-').length - 1];
                    blocos = {
                        naturezaImagem,
                        nomeAmigavel,
                        dadosAtas
                    }
                    inserirContainerDados(e.target.value, idContainer, blocos);                                               
                });
                tipoArquivosEvent = true;
            }            
        } 
        //incrementando o ID
        id++;
    }, 40);
};

//gera os links quando o arquivo a ser caregado é do tipo 'DIVERSOS'
let rotinasInsercaoLink = (e) => {
    let id = e.target.id.split('-').pop(), paginaDeEdicao = document.querySelector(`.editar-conteudo`), pagina;
    if (document.querySelector(`#tipo-arquivo-${id} option[value='diversos']`).selected) {
        if (document.getElementById(`link-anexo-${id}`)) {
            document.getElementById(`link-anexo-${id}`).innerHTML = '';
        }   
        paginaDeEdicao ? pagina = document.getElementById(`nome`).value : pagina = textoCamelCase(document.getElementById(`nome`).value);       
        let dataUpload = moment(new Date()).format('YYYY-MM-DD');
        let nomeAmigavel = textoCamelCase(document.getElementById(`nome-amigavel-${id}`).value);
        let extensao = document.querySelector(`.texto-anexo-${id}`).innerHTML.split('.').pop();
        let path, dataNoticia;
        if (document.getElementById(`radio0`).checked) {
            path= `/docs/${pagina}/emUso/`;
            dataNoticia = '';
        } else {            
            path = `/docs/diversos/emUso/`;
            if (document.getElementById(`data`).value !== '' && !paginaDeEdicao) {
                dataNoticia = `${document.getElementById(`data`).value}-`;
            } else if (!paginaDeEdicao) {
                dataNoticia = `${dataUpload}-`
            } else if (paginaDeEdicao) {
                dataNoticia = '';
            }
        }
        let link = `${path}diversos_${dataNoticia}${pagina}_${dataUpload}_${nomeAmigavel}.${extensao}`;
        document.getElementById(`link-anexo-${id}`).insertAdjacentHTML('beforeend', link);
    } 
    
    
};

//inserindo arquivos
let id = 0;

//manipulando arquivos reportar problema
if (document.querySelector(".file-upload-problema")) {
    document.querySelector(".file-upload-problema").addEventListener("change", function(e) {
        //inserindo arquivos reportar problema
        if(e.target.id === "anexoProblema" && document.querySelector("#label-anexo-problema i").classList.contains("fa-upload")) {
            anexos(e, "anexo-problema", "inserir");
        }
    });
    //removendo arquivos reportar problema
    document.querySelector(".file-upload-problema").addEventListener("click", function(e){
        if(e.target.id === "anexoProblema" && document.querySelector("#label-anexo-problema i").classList.contains("fa-times")) {
            anexos(e, "anexo-problema", "remover");
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    let idForm;
    if (document.getElementById('enviar-conteudo')) {
        idForm = 'enviar-conteudo';
    } else if (document.getElementById('inserir-conteudo')) {
        idForm = 'inserir-conteudo';
    } else if (document.getElementById('form-ds')) {
        idForm = 'form-ds';
    } else {
        idForm = document.location.href.split("/").pop();
    }
    
    //listener do botão de eliminar arquivo
    document.getElementById(idForm).addEventListener('click', (e) => {
        let janelaArquivo;
        if (e.target.classList.contains('fechar-janela')) {
            janelaArquivo = document.getElementById(e.target.dataset.ref);
            janelaArquivo.classList.add("maior2");
            setTimeout(function(){
                janelaArquivo.classList.add("minimiza2");
                janelaArquivo.classList.add("opacidade-zero");
            }, 300);
            setTimeout(function(){
                janelaArquivo.outerHTML = "";                    
            }, 600);
        }    
        
        //listener dos botões "checked" ou adicionar arquivos
        if (e.target.classList.contains('anexo-ok') || e.target.classList.contains('btn-inserir-arquivos')) {            
            let faltaCampo = false,
                inputsTodos = document.querySelectorAll(`.file-upload-arquivos input[required], .file-upload-arquivos select[required]`),
                inputsContainer;
                
            if (document.querySelector('.file-upload-arquivos')) {
                if (e.target.classList.contains('btn-inserir-arquivos')) {
                    faltaCampo = variaveisGlobais.checarInputs(inputsTodos);
                } else {
                    inputsContainer = document.querySelectorAll(`#${e.target.parentElement.id} input, #${e.target.parentElement.id} select`);
                    faltaCampo = variaveisGlobais.checarInputs(inputsContainer);
                }
            }   
            if (!faltaCampo) {
                if (e.target.classList.contains('anexo-ok')) {
                   e.target.parentElement.classList.toggle('anexo-resumo');                   
                   document.getElementById(`label-anexo-${e.target.parentElement.id.split('-').pop()}`).classList.toggle('readonly');
                } else if (document.querySelector('.file-upload-arquivos') && e.target.classList.contains('btn-inserir-arquivos')) {
                    document.querySelectorAll(`.file-upload-arquivos`)[0].classList.add("anexo-resumo");
                }
                if (e.target.classList.contains('btn-inserir-arquivos')) {
                    inserirArquivos();
                }
            }            
        }
     });  

    document.querySelector(`.arquivos-container`).addEventListener(`change`, function(e){
        if (e.target.classList.contains('anexo') || e.target.name === 'nomeAmigavel') {
            rotinasInsercaoLink(e);
        }
         
    });

    if (document.getElementById(`nome`)) {
        document.getElementById(`nome`).addEventListener('change', (e) => {
            let links = document.querySelectorAll(`.link-anexo`);        
            for (let i = 0; i < links.length; i++) {
               let nomeVetor = links[i].innerHTML.split('_');
               nomeNovo = `${nomeVetor[0]}_${textoCamelCase(e.target.value)}_${nomeVetor[2]}_${nomeVetor[3]}`;
               links[i].innerHTML = nomeNovo;
            }
            
            //TODO: Criar rotina para modificar os nomes de arquivo ao mudar o nome do conteúdo
        });
    }
});
