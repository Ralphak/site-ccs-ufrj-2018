const fs = require("fs"),
      sharp = require("sharp"),
      moment = require("moment"),
      rimraf = require('rimraf');

let copiarNovoArquivo = (file, pagina, nome) => {    
    file.mv(`${process.env.PATH_TO_DOCS}/${pagina}/emUso/${nome}`);
};

let apagarArquivos = (path) => {   
    fs.unlink(path, (err) => {
        return err ? "erro" : "arquivo apagado";
    });
};

//Quando inserido um novo arquivo em uma pasta, move arquivo duplicado para a subpasta "arquivados". A função também pode ser chamada independentemente, apenas para arquivar documentos, movendo-o da pasta ativa para a pasta "arquivados", se o primeiro argumento (newFile) for falso. Ao mover um aruquivo para a pasta de arquivados, é muito importante apagar seu registro no Banco de Dados!
var copiarEArquivar = (newFile, oldFile, pagina) => {
    fs.rename(`${process.env.PATH_TO_DOCS}/${pagina}/emUso/${oldFile}`, `public/docs/${pagina}/arquivados/${oldFile}`, function(err) {
        if (newFile) {
            copiarNovoArquivo(newFile, pagina, oldFile);
        }
    });
};

//grava arquivos em uma dada pasta. Se o arquivo já existir, o anterior é movido para a subpasta "arquivados"
let inserirArquivos = (documentos, pagina) => {
    fs.readdir(`${process.env.PATH_TO_DOCS}/${pagina}/emUso`, (err, files) => {            
        for (let i = 0; i < documentos.length; i++) {       
            let igual = false;
            if (files) {
                for (let j = 0; j < files.length; j++) {
                    if (documentos[i]._id === files[j]) {
                        console.log('achou igual >>>', files[j]);
                        igual = true;                        
                        break;
                    }    
                }
                if (igual) {
                    copiarEArquivar(documentos[i].arquivo, documentos[i]._id, pagina); 
                } else {
                    documentos[i].arquivo.mv(`public/docs/${pagina}/emUso/${documentos[i]._id}`);
                }
            } else {
                documentos[i].arquivo.mv(`public/docs/${pagina}/emUso/${documentos[i]._id}`);
            }
        }                    
    });
};

//deletando arquivos diversos
let deletarDiversos = async(body) => {
    let arquivosDiversos = [];
    fs.readdir(`${process.env.PATH_TO_DOCS}/diversos/emUso`, (err, files) => {
        for (let i = 0; i < files.length; i++) {
            if(files[i].includes(body.id)) {
                arquivosDiversos.push(files[i])
            }
        }
        for (let i = 0; i < arquivosDiversos.length; i++) {
            apagarArquivos(`${process.env.PATH_TO_DOCS}/diversos/emUso/${arquivosDiversos[i]}`);
        }
    });  
}

//transforma textos com espaços simples, escritos em minúsculas, em camelCase, sem diacríticos
let textoCamelCase = (texto) => {
    texto.trim();
    let textoSemEspacos = texto.split(" ")[0].toLowerCase();
    for (let i = 1; i < texto.split(" ").length; i++) {
        textoSemEspacos += texto.split(" ")[i].slice(0,1).toUpperCase() + texto.split(" ")[i].slice(1, texto.split(" ")[i].length).toLowerCase();
    }
    let textoNormalizado = textoSemEspacos.normalize('NFD').replace(/[\u0300-\u036f]/g, "");  
    return textoNormalizado;
};

var contarDocumentos = (files, body) => {
    let imagens = 0, atas = 0, diversos = 0, quant = {};
    for (let i = files.anexo.length - 1; i >= 0; i--) {
        if (body.tipoArquivo[i] === "ata") {
            atas++;
        } else if (body.tipoArquivo[i] === "diversos"){
            diversos++;
        } else {
            imagens++;
        }
    }
    return quant = {atas, diversos, imagens};
};

// prepara o documento para ser salvo em disco e no banco de dados, se for único e não-imagem
let unicoArquivoNaoImagem = (files, body, pagina) => {
    let extensao = files.anexo.name.split('.').pop();
    let dataDoUpload = moment(new Date()).format('YYYY-MM-DD'), obj = {};    
    if (body.tipoArquivo === 'ata') {
        tipoSessao = body.tipoSessao;
        nomeAmigavel = `Sessão ${tipoSessao} de nº ${('000' + body.numeroSessao).slice(-3)} - ${moment(body.dataSessao).format('DD [de] MMMM [de] YYYY')}`; 
        nome = `${body.tipoArquivo}_${pagina}_${textoCamelCase(nomeAmigavel)}.${extensao}`;
        dataSessao = body.dataSessao;
        numeroSessao = Number(body.numeroSessao);
        ano = Number(body.dataSessao.split('-')[0]);
        arquivo = files.anexo;
        obj = {_id: nome, pagina: pagina, tipo: body.tipoArquivo, nomeAmigavel, dataSessao, numeroSessao, tipoSessao, ano, arquivo};

    } else if (body.tipoArquivo === 'diversos') {        
        nomeAmigavel = body.nomeAmigavel;
        nome = `${body.tipoArquivo}_${pagina}_${dataDoUpload}_${textoCamelCase(nomeAmigavel)}.${extensao}`;  
        arquivo = files.anexo;
        obj = {_id: nome, pagina: pagina, tipo: body.tipoArquivo, nomeAmigavel, arquivo}
    }    
    return obj;
};

// remove as imagens do array de anexos e retorna um array específico com estas: isArray é propriedade booleana, que indica se a imagem está num array com outros arquivos ou provém de um único elemento do body
let separarImagens = (files, body, quant, isArray) => {
    let imagens = [];
    if (isArray) {
        if (quant.imagens === 1) {
            let objImagem = {};
            objImagem.nomeImagem = body.nomeImagem;
            objImagem.tipoImagem = body.tipoImagem;
            for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
                if (body.tipoArquivo[i] === 'imagem') {
                    body.tipoArquivo.splice(i, 1);
                    objImagem.arquivo = files.anexo[i];
                    files.anexo.splice(i, 1);
                    imagens.push(objImagem);
                    break;
                }
            }
        } else if (quant.imagens > 1) {            
            for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
                let objImagem = {};
                if (body.tipoArquivo[i] === 'imagem') {
                    //copiando o nome da imagem para o novo objeto e apagando do body
                    objImagem.nomeImagem = body.nomeImagem[body.nomeImagem.length - 1];
                    body.nomeImagem.splice(body.nomeImagem.length - 1, 1);
    
                    //copiando o tipo da imagem para o novo objeto e apagando do body
                    objImagem.tipoImagem = body.tipoImagem[body.tipoImagem.length - 1];
                    body.tipoImagem.splice(body.tipoImagem.length - 1, 1);
    
                    //extraindo demais propriedades do body e do array de anexos
                    body.tipoArquivo.splice(i, 1);
                    objImagem.arquivo = files.anexo[i];
                    files.anexo.splice(i, 1);
                    imagens.push(objImagem);                    
                }
            }
        }
    } else {             
        let objImagem = {};
        objImagem.nomeImagem = body.nomeImagem;
        objImagem.tipoImagem = body.tipoImagem;
        objImagem.arquivo = files.anexo;                
        imagens.push(objImagem);  
    }
    return imagens;
};

var separarAtas = (files, body, quant, pagina) => {
    let extensao, atas = [];    
    if (quant.atas === 1) {
        let objAta = {};
        for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
            if (body.tipoArquivo[i] === 'ata') {
                extensao = files.anexo[i].name.split('.')[files.anexo[i].name.split('.').length - 1];
                objAta.tipo = body.tipoArquivo[i];
                body.tipoArquivo.splice(i, 1);
                objAta.pagina = pagina;
                objAta.arquivo = files.anexo[i];
                files.anexo.splice(i, 1);
                objAta.tipoSessao = body.tipoSessao;
                objAta.dataSessao = body.dataSessao;
                objAta.ano = Number(objAta.dataSessao.split('-')[0]);
                objAta.numeroSessao = body.numeroSessao;
                ('000' + objAta.numeroSessao).slice(-3)
                objAta.nomeAmigavel = `Sessão ${objAta.tipoSessao} de nº ${('000' + objAta.numeroSessao).slice(-3)} - ${moment(objAta.dataSessao).format('DD [de] MMMM [de] YYYY')}`;  
                let nome = `${objAta.tipo}_${objAta.pagina}_${textoCamelCase(objAta.nomeAmigavel)}.${extensao}`;                
                objAta._id = nome;
                break;
            }
        }
        atas.push(objAta);
    } else if (quant.atas > 1) {
        for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
            let objAta = {};
            if (body.tipoArquivo[i] === 'ata') {
                extensao = files.anexo[i].name.split('.')[files.anexo[i].name.split('.').length - 1];
                
                //copiando a data da sessao para o novo objeto e apagando do body
                objAta.tipoSessao = body.tipoSessao[body.tipoSessao.length - 1];
                body.tipoSessao.splice(i, 1);
                objAta.dataSessao = body.dataSessao[body.dataSessao.length - 1];
                objAta.ano = Number(objAta.dataSessao.split('-')[0]);
                body.dataSessao.splice(body.dataSessao.length - 1, 1);
                objAta.pagina = pagina;
                //copiando o numero da sessao e as propriedades correlatas para o novo objeto e apagando do body
                objAta.numeroSessao = body.numeroSessao[body.numeroSessao.length - 1];
                objAta.nomeAmigavel = `Sessão ${objAta.tipoSessao} de nº ${('000' + objAta.numeroSessao).slice(-3)} - ${moment(objAta.dataSessao).format('DD [de] MMMM [de] YYYY')}`;  
                objAta.tipo = body.tipoArquivo[i];
                body.tipoArquivo.splice(i, 1);
                let nome = `${objAta.tipo}_${objAta.pagina}_${textoCamelCase(objAta.nomeAmigavel)}.${extensao}`;                
                objAta._id = nome;
                body.numeroSessao.splice(body.numeroSessao.length - 1, 1);

                //extraindo demais propriedades do body e do array de anexos
                objAta.arquivo = files.anexo[i];
                files.anexo.splice(i, 1);
                atas.push(objAta);                    
            }
        }
    }
    return atas;
};

var separarDiversos = (files, body, quant, pagina) => {
    let extensao, diversos = [],
    dataDoUpload = moment(new Date()).format('YYYY-MM-DD');
    if (quant.diversos === 1) {
        let objDiversos = {};
        for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
            if (body.tipoArquivo[i] === 'diversos') {
                extensao = files.anexo[i].name.split('.')[files.anexo[i].name.split('.').length - 1];
                objDiversos.tipo = body.tipoArquivo[i];
                objDiversos.pagina = pagina;
                objDiversos.arquivo = files.anexo[i];
                objDiversos.nomeAmigavel = body.nomeAmigavel;
                let nome = `${objDiversos.tipo}_${objDiversos.pagina}_${dataDoUpload}_${textoCamelCase(objDiversos.nomeAmigavel)}.${extensao}`;     
                objDiversos._id =  nome;
                break;
            }
        }
        diversos.push(objDiversos);
    } else if (quant.diversos > 1) {
        for (let i = body.tipoArquivo.length - 1; i >= 0; i--) {
            let objDiversos = {};
            if (body.tipoArquivo[i] === 'diversos') {
                extensao = files.anexo[i].name.split('.')[files.anexo[i].name.split('.').length - 1];
                objDiversos.tipo = body.tipoArquivo[i];
                objDiversos.pagina = pagina;
                objDiversos.nomeAmigavel = body.nomeAmigavel[i];
                let nome = `${objDiversos.tipo}_${objDiversos.pagina}_${dataDoUpload}_${textoCamelCase(objDiversos.nomeAmigavel)}.${extensao}`;                
                objDiversos._id =  nome;

                //extraindo demais propriedades do body e do array de anexos                
                objDiversos.arquivo = files.anexo[i];                
                diversos.push(objDiversos);                    
            }
        }
    }
    return diversos;
};

var salvarImagens = (imagens) => {
    for (let i = 0; i < imagens.length; i++) {
        if (imagens[i].tipoImagem === 'conteudos') {
            imagens[i].arquivo.mv(`public/img/conteudos/${imagens[i].nomeImagem}`);
        } else {
            imagens[i].arquivo.mv(`public/img/depoimentos/${imagens[i].nomeImagem}`);
        }
    }
};

//prepara um array com registros de arquivos armazenados em disco para gravação no Banco de dados
var prepararDocumentos = (body, files, pagina) => {    
    let documentos = [],  nomeAmigavel, dataSessao, numeroSessao, ano, extensao, dataDoUpload = moment(new Date()).format('YYYY-MM-DD');

    //procedimentos para envio de apenas um arquivo não-imagem
    if (!Array.isArray(files.anexo) && body.tipoArquivo !== "imagem") {   
        documentos.push(unicoArquivoNaoImagem(files, body, pagina));

    //procedimentos para envio de um array, com imagens, diversos e atas    
    } else if (Array.isArray(files.anexo)) {   
        let quant = contarDocumentos(files, body);  

        // removendo as imagens do array de anexos e criando um array específico para estas:
        let imagens = separarImagens(files, body, quant, true);     
        
        //salvando as imagens
        salvarImagens(imagens);

        //separando as atas
        atas = separarAtas(files, body, quant, pagina);        
        for (let i = 0; i < atas.length; i++) {
            documentos.push(atas[i]);
        }

        //separando os arquivos diversos
        diversos = separarDiversos(files, body, quant, pagina);
        for (let i = 0; i < diversos.length; i++) {
            documentos.push(diversos[i]);
        }
    //caso restante: apenas uma imagem
    } else {
        let imagem = separarImagens(files, body, null, false);  
        salvarImagens(imagem);
    }
    return documentos;
}

let excluirPasta = (pasta) => {
    rimraf(`public/docs/${pasta}`, () => { 
        console.log('done'); 
    });
};

module.exports = {
    inserirArquivos,
    copiarEArquivar,
    textoCamelCase,
    prepararDocumentos,
    excluirPasta,
    apagarArquivos,
    deletarDiversos
};