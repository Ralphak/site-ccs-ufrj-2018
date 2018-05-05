const express = require("express"),
      router = express.Router(),
      bodyParser = require("body-parser"),
      moment = require("moment"),
      mongoose = require("../mongoose"),
      bcrypt = require('bcrypt'),
      randomstring = require("randomstring"),
      sharp = require("sharp"),
      fileUpload = require('express-fileupload'),
      fs = require('fs'),
      //removeDiacritics = require('diacritics').remove,

      //meus modelos
      Reserva = require("../models/modeloReserva"),
      ReservaConcluida = require("../models/modeloReservaConcluida"),
      Auditorio = require("../models/modeloAuditorio"),
      Conteudo = require("../models/modeloConteudo"),
      Contato = require("../models/modeloContato"),
      Os = require ("../models/modeloOS"),
      Ds = require ("../models/modeloDS"),
      DsConcluida = require("../models/modeloDsConcluida"),
      OsConcluida = require("../models/modeloOsConcluida"),
      Documento = require("../models/modeloDocumento"),     
           

      //meus módulos
      inserirArquivos = require("../myModules/arquivos").inserirArquivos,
      copiarEArquivar = require("../myModules/arquivos").copiarEArquivar,
      textoCamelCase = require("../myModules/arquivos").textoCamelCase,
      prepararDocumentos = require("../myModules/arquivos").prepararDocumentos,
      deletarDiversos = require("../myModules/arquivos").deletarDiversos,
      excluirPasta = require("../myModules/arquivos").excluirPasta, 
      apagarArquivos = require("../myModules/arquivos").apagarArquivos, 
      horariosDOM = require("../myModules/calendario").horariosDOM,
      nodeMailer = require("../myModules/nodeMailer").smtpTrans,
      nodeMailerAnexos = require("../myModules/nodeMailer").anexos,
      criarLogErro = require("../myModules/rotinasAutomatizadas").criarLogErro,
      deletarOsEncerrarDs = require("../myModules/rotinasManutencao").deletarOsEncerrarDs;


//////////////////////////////////////////
/////////////// VARIABLES ////////////////
//////////////////////////////////////////

var urlEncoded = bodyParser.urlencoded({extended:false});
moment.locale("pt-br");

var bannerSite = `<div class="mensagem">`;

var bannerMail = `<div style="max-width:800px; margin: 0 auto; padding: 0; border: 1px solid #ccc" class="mensagem">
    <a target="_blank" href="http://www.ccs.ufrj.br"><img src="http://www.ccs.ufrj.br/img/banner.jpg"></a>`;
var rodape = `    
    <div style="background-color: #2c3430; color: #fff; max-width: 800px; margin: 0 auto; padding: 5px 20px; box-shadow: 0 0px 9px -1px rgba(0,0,0,0.45); text-align: center;">
        <a style="text-decoration: none; color: #fff;" target="_blank" href="https://goo.gl/maps/wWfRpxDbuWD2" target="_blank">
            <h2>CENTRO DE CIÊNCIAS DA SAÚDE | UFRJ</h2>
            <p style="margin-bottom: -0.3rem;">Avenida Carlos Chagas Filho, 373 - Bloco K - 2º andar - sala 20</p> 
            <p style="margin-bottom: -0.3rem;">CEP 21941-902 - Cidade Universitária - Rio de Janeiro - RJ.</p>
        </a>  
        <a style="text-decoration: none; color: #fff;" target="_blank" href="tel:21-2562-6684">
            <p style="margin-bottom: -0.3rem";>telefone: (21) 2562-6684</p>
        </a>        
    </div>
`;

var dadosDoEvento = function(obj, reserva) {
    return `
        <div>
            <p> <strong> Código do pedido:</strong> ${obj._id}</p>
            <p> <strong> Evento:</strong> ${obj.evento}</p>
            <p> <strong> Responsável pelo evento:</strong> ${obj.nomeResponsavel}</p>
            <p> <strong> Auditório:</strong> ${obj.auditorioNome}</p>
            <p> <strong> Público:</strong> ${obj.publico} pessoas</p>
            <p> <strong> Natureza do evento:</strong> ${obj.naturezaEvento}</p>
            <p> <strong> Especificações do pedido:</strong> ${obj.informacoesComplementares}</p>
            <p><strong> Horários:</strong></p>
            ${reserva}
        </div>
        `;
};

var dadosDoChamado = function(obj){
    return `
        <div>
            <p> <strong> Código do chamado:</strong> ${obj._id}</p>
            <p> <strong> Solicitante:</strong> ${obj.solicitante}</p>
            <p> <strong> Matrícula:</strong> ${obj.matricula}</p>
            <p> <strong> Categoria:</strong> ${obj.categoria}</p>
            <p> <strong> Unidade:</strong> ${obj.unidade}</p>
            <p> <strong> Cargo ou função:</strong> ${obj.cargo}</p>
            <p> <strong> Localização para contato:</strong> ${obj.localTrabalho}</p>
            <p> <strong> Local do serviço:</strong> ${obj.local}</p>
            <p> <strong> Telefone:</strong> ${obj.telefone}</p>
            <p> <strong> E-mail:</strong> ${obj.email}</p>
            <p> <strong> Horários:</strong> ${obj.horarios}</p>
            <p> <strong> Descrição:</strong> ${obj.descricao}</p>
            <p> <strong> Observações:</strong> ${obj.obs}</p>
        </div>
    `;
};

var usuario, permissoes;

var mensagens = [
    "<p>Ocorreu um erro em sua requisição. Favor tentar novamente, ou <a href='/faleConosco'>entre em contato conosco</a></p>"
]

var substituirTag = function(req, nome) {
    var texto = req.body.texto;
    if (req.body.texto.indexOf("{imagem}") > -1) {
        texto = req.body.texto;
        for (let i = req.body.texto.match(/{imagem}/g).length - 1; i >= 0; i--) {           
            texto = texto.replace("{imagem}", `<img src="/img/conteudos/${nome + (req.body.texto.match(/{imagem}/g).length - 1 - i)}.jpg">`);
        }
    }
    if (req.body.texto.indexOf("{legenda}") > -1) {
        for (let i = req.body.texto.match(/{legenda}/g).length - 1; i >= 0; i--) {
            texto = texto.replace("{legenda}", `<p class="legenda">`);
            texto= texto.replace("{/legenda}", `</p>`);
        }
    }
    return texto;
};
//////////////////////////////////////////
///////////////// ROTAS //////////////////
//////////////////////////////////////////

//Rota intermediária a todas as rotas
router.all("*", function(req, res, next){
    if (req.user) {
        usuario = req.user.nome.split(" ")[0];
        permissoes = req.user.permissoes;
    } else{
        usuario = undefined;
    }
    next();
});
//
router.post('/arquivos/excluir', urlEncoded, (req, res) => {
    let arquivos = req.body['arquivos[]'];
    Documento.find({nomeAmigavel: { $in: arquivos}}, (err, docs) => {
        if (err || docs.length === 0) {
            res.json("<h3>Ocorreu um erro interno e os arquivos não foram excluídos</h3>");
        } else {
            Documento.remove({nomeAmigavel: { $in: arquivos}}, (err) => { 
                for (let i = 0; i < docs.length; i++) {
                    if (req.body.natureza === `pagina`) {
                        apagarArquivos(`${process.env.PATH_TO_DOCS}/${req.body.pagina}/emUso/${docs[i]._id}`);
                    } else {
                        apagarArquivos(`${process.env.PATH_TO_DOCS}/diversos/emUso/${docs[i]._id}`);
                    }
                    
                }    
                res.json('<h3>Arquivos excluídos</h3>');
            });
        }
    });
});

router.post("/conteudos/inserir", urlEncoded, function(req, res){
    //TODO: criar no frountEnd rotina para inserir automaticamente a data de publicação de páginas (2014-01-01), omitindo esse campo no formulário e excluir essa rotina do server! 
    let data, dataAmigavel, nome, liveVideo, dataDeExibicao;    

    //tratamento das propriedades do objeto conteúdo:
    if (req.body.data && req.body.natureza !== "pagina") {
        data = moment(req.body.data).format();
        dataAmigavel = moment(req.body.data).format("DD MMM YYYY");
        nome = `${moment(req.body.data).format("YYYY-MM-DD")}-${req.body.nome}`;
    } else if (!req.body.data && req.body.natureza !== "pagina") {
        data = new Date();
        dataAmigavel = moment(data).format("DD MMM YYYY");
        nome = `${moment(data).format("YYYY-MM-DD")}-${req.body.nome}`;
    } else if (req.body.natureza === "pagina") {
        data = new Date(2014, 0, 1);
        dataAmigavel = null;
        nome = req.body.nome;
    } else if (req.body.natureza === "depoimento") {
        data = new Date();
        dataAmigavel = moment(data).format("DD MMM YYYY");
        nome = `${moment(req.body.data).format("YYYY-MM-DD")}-${req.body.nome}`;
    }   

    let temDocumento;
    if (req.body.natureza !== 'depoimento') {
        req.files ? temDocumento = true : temDocumento = false;
    } else {
        temDocumento = false;
    }
    
    //definir o arquivo multimídia, de acordo com a natureza
    let midia = null;

    if (req.body.natureza === "video" || req.body.natureza === "foto") {
        midia = req.body.midia;
    }   
    let subtipo = null;
    if (req.body.subtipo) {
        subtipo = req.body.subtipo;
    } 
    //transformando o nome do conteúdo em camel case e retirando acentos diacríticos
    let nomeSemEspacos = textoCamelCase(nome);  
    //retirando espaços e outros caracteres, que não letras, números e traço
    nomeConteudo = nomeSemEspacos.replace(/[^a-zA-Z0-9-]/g,'');

    //Inserindo imagens que constem, eventualmente, no texto
    let texto = substituirTag(req, nomeSemEspacos);
    let preTexto;
    //inserindo a foto 
    if (req.body.natureza === 'depoimento') {
        preTexto =  `<div class='depoimentos'><div class='container depoimentos-identificacao'><img src='/img/depoimentos/depoimento_${nomeConteudo}.jpg' alt='${req.body.personagem}, ${req.body.atuacao}'><span class='nome'>${req.body.personagem}</span><span class='titulo'>${req.body.atuacao}</span></div></div>`;
    } else {
        preTexto = '';
    }
    let textoFinal = preTexto + texto;
    
    if (req.body.diaDeExibicao)  {
        liveVideo = true;
        dataDeExibicao = `${req.body.diaDeExibicao}T${('0' + req.body.horaDaExibicao).slice(-2)}:${('0' + req.body.minutosDaExibicao).slice(-2)}:00.000Z`;
    } 
    Conteudo.create({
        _id: nomeConteudo,
        natureza: req.body.natureza,   
        subtipo,     
        titulo: req.body.titulo,
        autor: req.body.autor,
        texto:textoFinal,        
        imagem: req.body.imagem,
        legenda: req.body.legenda,
        midia,
        liveVideo,
        dataDeExibicao,
        tag: req.body.tags.split(","),
        data,
        dataAmigavel,
        temDocumento

    }, function(err, conteudo){
        if (err) {
            criarLogErro(err);
            res.render("erro", {mensagem: `<p>erro na criação do conteúdo:</p><div>${err}</div>`, usuario, permissoes});
        } else {  
            if (req.files) {
                //salvando os dados dos documentos no banco de dados
                let documentos = prepararDocumentos(req.body, req.files, conteudo._id);
                //gravando novos arquivos em disco
                if (conteudo.natureza === 'pagina') {
                    fs.access(`${process.env.PATH_TO_DOCS}/${conteudo._id}`, (err) => {
                        if (err) {
                            if (err.code === 'ENOENT') {
                                console.error('a pasta não existe...');
                                fs.mkdir(`${process.env.PATH_TO_DOCS}/${conteudo._id}`, () => {
                                    fs.mkdir(`${process.env.PATH_TO_DOCS}/${conteudo._id}/emUso`, () => {
                                        fs.mkdir(`${process.env.PATH_TO_DOCS}/${conteudo._id}/arquivados`, () => {
                                            inserirArquivos(documentos, conteudo._id);            
                                            Documento.create(documentos, (err, files) => {
                                                if (err) {
                                                    criarLogErro(err);            
                                                }
                                                res.redirect("/conteudos/inserir"); 
                                            });
                                        });
                                    });
                                });
                            } 
                        }                        
                    }); 
                } else {
                    inserirArquivos(documentos, 'diversos');            
                    Documento.create(documentos, (err, files) => {
                        if (err) {
                            criarLogErro(err);            
                        }
                        res.redirect("/conteudos/inserir"); 
                    });
                }                
            } else {
                res.redirect("/conteudos/inserir"); 
            }       
        }
    });
});

//edicao de conteúdos
router.post("/conteudos/editar/:id", urlEncoded, function(req, res){    
    Conteudo.findById(req.params.id, function(err, conteudo) {
        if (err) {
            res.render("erro", {mensagem: "Conteúdo não localizado", usuario, permissoes});
        } else {            
            conteudo.titulo = req.body.titulo;
            conteudo.autor = req.body.autor;
            conteudo.legenda = req.body.legenda;   
            var tags = req.body.tags.split(",");
            conteudo.tag = [];
            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i].trim();
                conteudo.tag.push(tag);
            }
            if (req.body.imagem) {
                conteudo.imagem = true;
            } else {
                conteudo.imagem = false;
            }
            
            conteudo.texto = substituirTag(req, req.body.nome);  
            conteudo.midia = "";
            if (conteudo.natureza === "video") {
                conteudo.midia = req.body.midia;
                conteudo.subtipo = req.body.subtipo;
                conteudo.imagem = false;
            }
            if (conteudo.natureza === "foto") {
                conteudo.midia = req.body.midia;
                conteudo.imagem = false;
            }
            if (req.body.diaDeExibicao)  {
                conteudo.liveVideo = true;
                conteudo.dataDeExibicao = `${req.body.diaDeExibicao}T${('0' + req.body.horaDaExibicao).slice(-2)}:${('0' + req.body.minutosDaExibicao).slice(-2)}:00.000Z`;
            } 
            if (req.files) {
                //salvando os dados dos documentos novos no banco de dados
                let documentos = prepararDocumentos(req.body, req.files, conteudo._id);
                //gravando novos arquivos em disco
                let pasta;
                conteudo.natureza === 'pagina' ? pasta = conteudo._id : pasta = 'diversos';
                inserirArquivos(documentos, pasta);                                
                Documento.create(documentos, (err, files) => {
                    if (err) {
                        criarLogErro(err);            
                    }
                    if (conteudo.natureza !== 'depoimento' && conteudo.temDocumento === false) {
                        conteudo.temDocumento = true;
                    }  
                    conteudo.save();
                    res.redirect("/conteudos/localizar");   
                });
            } else {                    
                Documento.find({pagina: conteudo._id}, (err, docs) => {
                    if (err) {
                        console.log('erro buscando documentos', err);
                    } else if (conteudo.natureza !== 'depoimento'){
                        docs.length > 0 ? conteudo.temDocumento = true : conteudo.temDocumento = false;
                        conteudo.save();
                        res.redirect("/conteudos/localizar");
                    }
                });
            }     
        }
    });
});

//exclusão de conteúdos
router.post("/conteudos/excluir/:id", urlEncoded, function(req, res){    
    Conteudo.remove({_id: req.params.id}, function(err, obj) {
        let arquivosDiversos = []
        if (err) {
            res.render("erro", {mensagem: "<h2>Conteúdo não localizado</h2>", usuario, permissoes});
        } else {
            Documento.deleteMany({pagina: req.body.id}, async(err, docs) => {
                if (err) {
                    criarLogErro(err);
                    res.render("erro", {mensagem: "<h2>Erro ao excluir documentos</h2>", usuario, permissoes});
                } else {
                    if (req.body.natureza === 'pagina') {
                        excluirPasta(req.body.id);  
                    } else {
                        deletarDiversos(req.body);                       
                    }
                    res.render("sucesso", {mensagem: "<h2>Conteúdo excluído</h2>", usuario, permissoes});
                }
            });
        }
    });
});

//inserção de novos contatos
router.post("/contatos/inserir", urlEncoded, function(req, res){
    var nomeRegex = `/^${req.body.nome.trim()}$/i`; //para tornar a busca case insensitive
    Contato.find({$or:[{nome: nomeRegex}, {email:req.body.email.trim()}]}, function(err, obj) {
        if (obj.length !== 0) {
            res.render("erro", {mensagem: "<p>Usuário já fora cadastrado</p>", usuario, permissoes});
        } else {            
            Contato.create({
                nome: req.body.nome,
                email: req.body.email,
                telefone: req.body.tel,
                vinculo: req.body.vinculo,                
                senha: "",
                cargos: [],
                grupos: [],
                permissoes: {}
            }, function(err, contato){
                if (err) {
                    criarLogErro(err);
                    res.render("erro", {mensagem: `<p>erro na criação do contato:</p> <div>${err}</div>`, usuario, permissoes});
                }
                if(req.body.foto === "true") {
                    contato.foto = true;
                }
                if (typeof req.body.cargo !== "string") {
                    for (let i = 0; i < req.body.contexto.length; i++) {
                        let newCargo = {};
                        newCargo.contexto = req.body.contexto[i];
                        newCargo.cargo = req.body.cargo[i];
                        contato.cargos.push(newCargo);
                    }
                } else {
                    contato.cargos.push({contexto: req.body.contexto, cargo: req.body.cargo});
                }
                var grupos = req.body.grupos.split(",");

                for (let i = 0; i < grupos.length; i++) {
                    contato.grupos.push(grupos[i]);
                }
                if (req.body.permissoes) {
                    for (let i = 0; i < req.body.permissoes.length; i++) {
                        contato.permissoes[req.body.permissoes[i]] = true;
                    }
                    
                    //criar uma senha aleatória e enviar por email
                    var senhaTemp = randomstring.generate(8);
    
                    var mailOpts = {
                        from: `'Novo usuário - Sistemas da Decania CCS' <${process.env.USERMAIL}>`,
                        to: [req.body.email],
                        subject: "Senha temporária de acesso",
                        html: `
                            <div style="max-width:800px; margin: 0 auto; padding: 0; box-shadow: 0 0px 9px -1px rgba(0,0,0,0.45);" class="mensagem">
                                <img src="http://www.ccs.ufrj.br/img/banner.jpg">
                            </div>
                            <div style="background-color: #f2f2f2; padding: 30px 15px; max-width:800px; margin: 0 auto; box-sizing: border-box"> 
                                <p>Prezado(a) ${req.body.nome},</p>
                                <p>Confirmamos a criação seu cadastro para acesso aos sistemas da Decania do CCS. Para tal, é necessário realizar login na página principal, informando seu endereço de e-mail (o endereço receptor desta mensagem) e a seguinte senha:  ${senhaTemp}. Recomendamos que a altere, logo em seu primeiro acesso.</p>
                                <p>Agradecemos o cadastramento e reiteramos que estamos à disposição para quaisquer esclarecimentos que se façam necessários.</p>
                                <br>
                                <p>Atenciosamente,</p>
                                
                                <p><b>Thiago Rodrigues Meyer</b><br>
                                Setor de Comunicação da Decania do CCS</p>                                
                            </div>
                            ${rodape}`
                    };
        
                    nodeMailer.sendMail(mailOpts,function(error, response){
                        if(error){
                            console.log("not response");
                            res.render("erro", {mensagem: mensagens[0]});
                        } else {
                            bcrypt.hash(senhaTemp, 10, function(err, hash){
                                if(err) {
                                    console.log(err);
                                    res.render("erro", {mensagem: mensagens[0]});
                                } else {
                                    contato.senha = hash;
                                }
                            });
                        }                        
                    });
                }
                contato.save()
            });            
            res.render("contatos_inserir", {usuario, permissoes});
        }
    });
});

//edicao de contatos
router.post("/contatos/editar/:id", urlEncoded, function(req, res){    
    Contato.findById(req.params.id, function(err, contato) {
        if (err) {
            res.render("erro", {mensagem: "<p>Contato não localizado</p>, usuario, permissoes"});
        } else {
            contato.nome = req.body.nome;
            contato.email = req.body.email;
            contato.telefone = req.body.tel;
            contato.vinculo = req.body.vinculo;
            contato.cargos = [];
            if (req.body.foto) {
                contato.foto = req.body.foto;
            }
            if (typeof req.body.cargo !== "string") {
                for (let i = 0; i < req.body.contexto.length; i++) {
                    let newCargo = {};
                    newCargo.contexto = req.body.contexto[i];
                    newCargo.cargo = req.body.cargo[i];
                    contato.cargos.push(newCargo);
                }
            } else {
                contato.cargos.push({contexto: req.body.contexto, cargo: req.body.cargo});
            }

            var grupos = req.body.grupos.split(",");
            contato.grupos = [];
            for (let i = 0; i < grupos.length; i++) {
                contato.grupos.push(grupos[i]);
            }
            if (contato.permissoes.reservarAuditorios) {
                contato.permissoes.reservarAuditorios = false;
            }
            if (contato.permissoes.analisarReservaAuditorios) {
                contato.permissoes.analisarReservaAuditorios = false;
            }
            if (contato.permissoes.gerenteSistema) {
                contato.permissoes.gerenteSistema = false;
            }
            if (contato.permissoes.chefeManutencao) {
                contato.permissoes.chefeManutencao = false;
            }
            if (req.body.permissoes && typeof req.body.permissoes === "string") {
                contato.permissoes[req.body.permissoes] = true;
            } else if (req.body.permissoes) {
                for (let i = 0; i < req.body.permissoes.length; i++) {
                    contato.permissoes[req.body.permissoes[i]] = true;
                }
            }
            contato.save();
            res.render("contatos_localizar");
        }
    });
});

//exclusão de contatos
router.post("/contatos/excluir/:id", urlEncoded, function(req, res){
    Contato.remove({_id: mongoose.Types.ObjectId(req.params.id)}, function(err, obj) {
        if (err) {
            res.render("erro", {mensagem: "<h2>Usuário não localizado</h2>", usuario, permissoes});
        } else {
            res.render("sucesso", {mensagem: "<h2>Usuário excluído</h2>", usuario, permissoes});
        }
    });
});

router.post("/enviarConteudo", function(req, res){
    var mailOpts = {
        from: `'Envio de conteúdos - Decania CCS' <${process.env.USERMAIL}>`,
        to: [process.env.USERMAIL, process.env.ASCOMMAIL],//responsável pela postagem das imagens no site
        subject: req.body.subject,
        html: `${req.body.name} - ${req.body.usermail} escreveu: 
               ${req.body.corpo}`
    };
    var anexos = [];
    var mensagem = `
        <div class="mensagem">
        <h2> ${req.body.name}, agradecemos o envio do seguinte conteúdo:</h2>
        <div>
            <p><strong>Título:</strong> ${req.body.subject}</p>
            <p><strong>Natureza do conteúdo:</strong> ${req.body.conteudo}</p>
            <p><strong>Texto:</strong> ${req.body.corpo}</p>`;

    if (req.files) {
        mensagem = nodeMailerAnexos(req.files, anexos, mensagem);
        mailOpts.attachments = anexos;
    }
    mensagem += `</div></div>`;
    nodeMailer.sendMail(mailOpts,function(error, response){
        if (error) {
            res.render("erro", {mensagem:mensagens[0], usuario, permissoes});
        } else {
            res.render("sucesso", {mensagem, usuario, permissoes});
        }
    });
});

//editar reservas espaço via  AJAX
router.post("/reserva/editar", urlEncoded, function(req, res){
    Reserva.findById(req.body.id, function(err, reserva){
        if (err) {
            criarLogErro(err);
        } else {
            reserva.observacoes = req.body.obs;
            reserva.save();
            res.json(reserva);
        }
    });
});

router.post("/reserva", urlEncoded, function (req, res) {
    var horarios = req.body.horarios.split(",").sort();
    var repetido = false;      
    Reserva.create({
        evento: req.body.evento,
        auditorio: req.body.auditorio,
        auditorioNome: req.body.auditorioNome,
        nomeResponsavel: req.body.nomeResponsavel,
        emailResponsavel: req.body.emailResponsavel,
        telResponsavel: req.body.telResponsavel,
        publico: req.body.publico,
        naturezaEvento: req.body.naturezaEvento,
        informacoesComplementares:req.body.informacoesComplementares,
        registros: [
            {
                data: new Date(),
                texto: `Reserva requerida por ${req.user.nome}`
            }
        ],
        status: "requisitado",
        horarios: horarios
    }, function (err, obj) {
        if (err) {
            criarLogErro(err);
            return false;
        };
        //gerando string com todos os horários de reservas, para exibição no DOM e envio de mensagem
        var reserva = horariosDOM(horarios);
        //gerando a mensagem, com a função dadosDoEvento
        var dadosDaReserva = dadosDoEvento(obj, reserva);
        var mensagem =
            `<div style="background-color:#f2f2f2; padding: 30px 15px">
                    <h2>Prezado(a) ${obj.nomeResponsavel},</h2>
                    <p>Confirmamos o recebimento de seu pedido de reserva de espaço, conforme especificado abaixo:</a></p>
                    ${dadosDaReserva}

                    <p>Conserve esta mensagem para futuras conferências. Solicitamos, caso seja necessário cancelar esta reserva, que entre em contato conosco, imediatamente, <a target="_blank" href="http://www.ccs.ufrj.br/reserva/cancelar/${obj._id}">clicando neste hiperlink.</a></p>
                </div>
            </div>`;
        //depois de salvar, enviar e-mail confirmando a reserva
        var mailOpts = {
            from: `'Reserva de espaços para realização de eventos no CCS' <${process.env.USERMAIL}>`, //grab form data from the request body object
            to: [req.body.emailResponsavel, req.user.email], //TODO: adicionar registradores, divisão de ensino,  superintendencia acadêmica, outros
            subject: "Solicitação de reserva de espaços do CCS",
            html: bannerMail + mensagem + rodape
        };
        mensagem = bannerSite + mensagem;
        res.render("sucesso", {mensagem, usuario, permissoes}); //apagar depois
        nodeMailer.sendMail(mailOpts, function(error, response){
            if (error) {
                console.log(error);
                res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
            } else {
                res.render("sucesso", {mensagem, usuario, permissoes});
            }
        });
    });  
});

router.post("/reserva/analise/recusar", urlEncoded, function(req, res){
    if (req.body.justificativa) {
        var justificativa = ", com a seguinte justificativa: <br><strong>" + req.body.justificativa + ".<br></strong>";
    } else {
        var justificativa = "."
    }
    Reserva.findById(req.body.idReservaRecusar, function(err, reserva) {
        if (err) {
            criarLogErro(err);
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else if (!reserva) {
            res.render("erro", {mensagem:"<p>Este pedido de reserva não foi localizado em nossa base de dados</p>", usuario, permissoes});
        } else if (reserva.status === "requisitado" || reserva.status === "agendado") {
            reserva.registros.push({data: new Date(), texto: `Reserva recusada por ${req.user.nome}${justificativa}`});

            //procedimentos em caso de recusa de pedido
            let reservaSemId = reserva.toObject();
            delete reservaSemId._id;
            reservaSemId.status = 'recusado';
            ReservaConcluida.create(reservaSemId, function(err, obj){
                if (err) {
                    criarLogErro(err);
                    res.render("erro", {mensagem: "<p>Reserva não foi movida para a coleção de concluídas. Favor verificar o erro, ou <a href='/faleConosco'>entre em contato conosco</a></p>", usuario, permissoes});
                } else {
                    Reserva.remove({_id: req.body.idReservaRecusar}, function(err){
                        if(err) {
                            criarLogErro(err);
                            res.render("erro",{mensagem: "<p>Não foi possível remover a reserva da coleção 'reservas'</p>", usuario, permissoes})
                        } else {
                            var horarios = horariosDOM(reserva.horarios);

                            var dadosDaReserva = dadosDoEvento(reserva, horarios);
                            var mensagemRequerente = `
                                    <div style="background-color: #f2f2f2; padding: 30px 15px">
                                        <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                                        <p>Informamos que o pedido de reserva abaixo especificado foi recusado ${justificativa} Caso sejam necessários esclarecimentos, <a target="_blank" href="http://www.ccs.ufrj.br/faleConosco">favor entrar em contato conosco.</a></p>
                                        ${dadosDaReserva}
                                        <p>Conserve esta mensagem para futuras conferências.</p>
                                    </div>
                                </div>`;
                            var mensagemRegistrador = `
                                <div style="background-color: #f2f2f2; padding: 30px 15px">
                                <h2>Prezado(a) ${req.user.nome},</h2>
                                <p>Informamos que foi indeferido o pedido de reserva de espaço da Decania do CCS abaixo especificado ${justificativa}</p>
                                <p> <strong> Requerente:</strong> ${reserva.nomeResponsavel}</p>
                                ${dadosDaReserva}<a href="/reserva/analise"> <p>Clique aqui para retornar à página de análise de pedidos</p></a>
                                </div></div>`;
                            var mailOpts = {
                                from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                                to: [reserva.emailResponsavel],//TODO: adicionar: divisão de ensino, Super. Acadêmica, outros
                                subject: "Resposta a seu pedido de reserva de espaço",
                                html:  bannerMail + mensagemRequerente + rodape
                            };
                            mensagemRegistrador = bannerSite + mensagemRegistrador;
                            nodeMailer.sendMail(mailOpts, function(error, response){
                                if (error) {
                                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                                } else {
                                    //apagar a reserva do espaço
                                    if (reserva.status === 'agendado') {
                                        Auditorio.findById(reserva.auditorio, function (err, auditorio){
                                            if (err) {
                                                criarLogErro(err);
                                                res.render("erro", {mensagem: "<p>Não foi possível encontrar o espaço para exclusão de pedido de reserva</p>", usuario, permissoes})
                                            } else {
                                                for (let i = auditorio.reservas.length - 1; i >= 0; i--) {
                                                    if (auditorio.reservas[i] == req.body.idReservaRecusar) {
                                                        auditorio.reservas.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                                auditorio.save();                                
                                                res.render("sucesso", {mensagem: mensagemRegistrador, usuario, permissoes});
                                            }
                                        });
                                    } else {
                                        res.render("sucesso", {mensagem: mensagemRegistrador, usuario, permissoes});
                                    }
                                }
                            });
                        }
                    });                    
                }
            });
        }
    });
});

router.post("/reserva/analise/confirmar", urlEncoded, function(req, res){
    let pedidosParaExcluir = [];
    (req.body.excluirReserva && req.body.excluirReserva.constructor === Array) ? pedidosParaExcluir = [...req.body.excluirReserva] : pedidosParaExcluir.push(req.body.excluirReserva);  
    Reserva.findById(req.body.idReservaConfirmar, function(err, reserva){
        if(err) {
            criarLogErro(err);
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else if (reserva.status === "agendado") {
            res.render("erro", {mensagem:"<p>Este pedido de reserva já foi aprovado previamente</p>", usuario, permissoes});
        } else if (reserva.status === "requisitado") { 
        //procedimentos para exlusão dos pedidos concomitantes
            Reserva.find({'_id': { $in: pedidosParaExcluir}}, function(err, excluidos) {
                if(err) {
                    criarLogErro(err);
                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});            
                } else {
                    Auditorio.findById(reserva.auditorio).populate("reservas").exec(function(err, auditorio){
                        if (err) {
                            criarLogErro(err);
                            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                        } else {
                            auditorio.reservas.push(reserva._id);
                            auditorio.save();
                            for (let i = 0; i < excluidos.length; i++) {
                                let reservaSemId = excluidos[i].toObject();
                                delete reservaSemId._id;
                                reservaSemId.status = 'recusado';
                                ReservaConcluida.create(reservaSemId, function(err, reservaConcluida){
                                    if (err) {
                                        criarLogErro(err);
                                        res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                                    } else {                            
                                        //apagar a reserva da coleção reservas:
                                        Reserva.remove({_id: excluidos[i]._id}, function(err){
                                            if(err) {
                                                criarLogErro(err);
                                                res.render("erro",{mensagem: "<p>Não foi possível remover a reserva da coleção 'reservas'</p>", usuario, permissoes});
                                            } else {
                                                reservaConcluida.registros.push({data: new Date(), texto: `Reserva cancelada por concomitância`});
                                                reservaConcluida.save();
                                                var mensagem = ` 
                                                <div style="background-color: #f2f2f2; padding: 30px 15px">
                                                        <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                                                        <p>Informamos que seu pedido de reserva nº "${excluidos[i]._id}" do espaço "${excluidos[i].auditorioNome}" para a realização do evento "${excluidos[i].evento}" não foi aprovado pela Decania do CCS. 
                                                        <p>Caso sejam necessários esclarecimentos, <a href="/faleConosco">favor entrar em contato conosco.</a></p>
                                                    </div>
                                                </div>`;
            
                                                var mailOpts = {
                                                    from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                                                    to: [excluidos[i].emailResponsavel],//TODO: incluir pessoas que devem tomar conhecimento de cancelamentos
                                                    subject: "Solicitação de reserva de espaço recusada.",
                                                    html:  bannerMail + mensagem + rodape
                                                };
                                                mensagem = bannerSite + mensagem;
                                                nodeMailer.sendMail(mailOpts, function(error, response){
                                                    if (err) {
                                                        console.log('793');
                                                        criarLogErro(err)
                                                    } else {
                                                        console.log(`E-mail enviado a ${excluidos[i].nomeResponsavel}, informando que seu pedido de reserva de espaço foi cancelado.`);
                                                        //final dos procedimentos para exlusão de arquivos concomitantes
                                                        if (i === excluidos.length - 1) {
                                                            reserva.status = "agendado";
                                                            reserva.registros.push({data: new Date(), texto: `Reserva aprovada por ${req.user.nome}`});
                                                            reserva.save();
                                                            var horarios = horariosDOM(reserva.horarios);
                                                            var dadosDaReserva = dadosDoEvento(reserva, horarios);
                                                            var mensagemRequerente = `
                                                                <div style="background-color:#f2f2f2; padding: 30px 15px">
                                                                    <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                                                                    <p>Informamos que seu pedido de reserva de espaço foi aprovado, conforme especificado abaixo:</a></p>
                                                                    ${dadosDaReserva}
                                                                    <p>Conserve esta mensagem para futuras conferências. Solicitamos, caso seja necessário cancelar esta reserva, <a target="_blank" href="http://www.ccs.ufrj.br/reserva/cancelar/${reserva._id}"> que entre em contato conosco, imediatamente, clicando neste hiperlink.</a></p>
                                                                </div>
                                                            </div>`;
                                                            var mensagemRegistrador = `<div style="background-color: #f2f2f2; padding: 30px 15px">
                                                                <h2>Prezado(a) ${req.user.nome},</h2>
                                                                <p>Confirmamos o agendamento do pedido de reserva do espaço abaixo especificado;</p> <br>
                                                                <p> <strong> Requerente:</strong> ${reserva.nomeResponsavel}</p>
                                                                ${dadosDaReserva}
                                                                <a target="_blank" href="http://www.ccs.ufrj.br/reserva/analise"><p>Clique aqui para retornar à página de análise de pedidos</p></a>
                                                                </div></div>`;
                                                            var mailOpts = {
                                                                from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                                                                to: [reserva.emailResponsavel],//TODO: adicionar: responsável pela Administração da sede/bloco, divisão de ensino, Super. Acadêmica, outros
                                                                subject: "Resposta a seu pedido de reserva de espaços",
                                                                html:  bannerMail + mensagemRequerente + rodape
                                                            };
                                                            mensagemRegistrador = bannerSite + mensagemRegistrador;
                                                            nodeMailer.sendMail(mailOpts, function(error, response){
                                                                if (error) {              
                                                                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                                                                } else {
                                                                    res.render("sucesso", {mensagem: mensagemRegistrador, usuario, permissoes});
                                                                }
                                                            }); 
                                                        }
                                                    }
                                                });
                                            }
                                        });  
                                    }
                                });
                            }
                            if(excluidos.length === 0) {
                                reserva.status = "agendado";
                                reserva.registros.push({data: new Date(), texto: `Reserva aprovada por ${req.user.nome}`});
                                reserva.save();
                                var horarios = horariosDOM(reserva.horarios);
                                var dadosDaReserva = dadosDoEvento(reserva, horarios);
                                var mensagemRequerente = `
                                    <div style="background-color:#f2f2f2; padding: 30px 15px">
                                        <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                                        <p>Informamos que seu pedido de reserva de espaços foi aprovado, conforme especificado abaixo:</a></p>
                                        ${dadosDaReserva}
                                        <p>Conserve esta mensagem para futuras conferências. Solicitamos, caso seja necessário cancelar esta reserva, <a target="_blank" href="http://www.ccs.ufrj.br/reserva/cancelar/${reserva._id}"> que entre em contato conosco, imediatamente, clicando neste hiperlink.</a></p>
                                    </div>
                                </div>`;
                                var mensagemRegistrador = `<div style="background-color: #f2f2f2; padding: 30px 15px">
                                    <h2>Prezado(a) ${req.user.nome},</h2>
                                    <p>Confirmamos o agendamento do pedido de reserva do espaço abaixo especificado;</p> <br>
                                    <p> <strong> Requerente:</strong> ${reserva.nomeResponsavel}</p>
                                    ${dadosDaReserva}
                                    <a target="_blank" href="http://www.ccs.ufrj.br/reserva/analise"><p>Clique aqui para retornar à página de análise de pedidos</p></a>
                                    </div></div>`;
                                var mailOpts = {
                                    from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                                    to: [reserva.emailResponsavel],//TODO: adicionar: responsável pela Administração da sede/bloco, divisão de ensino, Super. Acadêmica, outros
                                    subject: "Resposta a seu pedido de reserva de espaço",
                                    html:  bannerMail + mensagemRequerente + rodape
                                };
                                mensagemRegistrador = bannerSite + mensagemRegistrador;
                                nodeMailer.sendMail(mailOpts, function(error, response){
                                    if (error) {                                       
                                        res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                                    } else {
                                        res.render("sucesso", {mensagem: mensagemRegistrador, usuario, permissoes});
                                    }
                                }); 
                            }
                        }
                    });
                }            
            });
        }   
    }); 
});

router.post("/reserva/cancelar", urlEncoded, function(req, res){
    Reserva.findById(req.body.codigoReserva, function(err, reserva){
        if (err || reserva == null) {
            criarLogErro(err);
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else {
            var horarios = horariosDOM(reserva.horarios);
            var dados = dadosDoEvento(reserva, horarios);
            var mensagem = `
                <div style="background-color:#f2f2f2; padding: 30px 15px">
                    <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                    Clique no botão ao final deste e-mail para cancelar o seguinte pedido de reserva:
                    ${dados}
                    <a target="_blank" href="http://www.ccs.ufrj.br/reserva/cancelar/${reserva._id}"><p style="background-color: #2c3531; padding: 10px 5px 10px 5px; margin: 20px auto; width: 270px; text-align:center; color: #ffffff; display: block">Clique aqui para concluir o cancelamento</p></a>
                </div>`;
            var mailOpts = {
                from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                to: [reserva.emailResponsavel],
                subject: "Solicitação de cancelamento de reserva de espaço",
                html:  bannerMail + mensagem + rodape
            };
            nodeMailer.sendMail(mailOpts, function(error, response){
                if (error) {
                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                } else {
                    res.render("sucesso", {mensagem: "<h2>Obrigado!<h2><p>Enviamos um e-mail ao responsável pela reserva com instruções para efetuar o cancelamento.</p> ", usuario, permissoes});
                }
            });
        }
    });
});

router.post("/reserva/cancelar/:id", urlEncoded, function(req, res){
    Reserva.findById(req.params.id, function(err, reserva){
        if(err ) {
            criarLogErro(err);
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else if (!reserva) {
            res.render("erro", {mensagem: `<h2>O código de reserva informado não foi encontrado em nossos bancos de dados</h2>`, usuario, permissoes});
        } else {
            let reservaSemId = reserva.toObject();
            delete reservaSemId._id;
            ReservaConcluida.create(reservaSemId, function(err, obj){
                if (err) {
                    criarLogErro(err);
                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                } else {
                    //apagar a reserva do espaço
                    Auditorio.findById(reserva.auditorio, function (err, auditorio){
                        if (err) {
                            criarLogErro(err);
                            res.render("erro", {mensagem: "<p>Não foi possível encontrar o espaço para exclusão de pedido de reserva</p>", usuario, permissoes});
                        } else {
                            for (let i = auditorio.reservas.length - 1; i >= 0; i--) {
                                if (auditorio.reservas[i] == req.params.id) {
                                    auditorio.reservas.splice(i, 1);
                                }
                            }
                            auditorio.save();

                            //apagar a reserva da coleção reservas:
                            Reserva.remove({_id: req.params.id}, function(err){
                                if(err) {
                                    criarLogErro(err);
                                    res.render("erro",{mensagem: "<p>Não foi possível remover a reserva da coleção 'reservas'</p>", usuario, permissoes});
                                } else {
                                    var horarios = horariosDOM(reserva.horarios);
                                    //obj.registros += `|| Reserva cancelada a pedido em ${moment(new Date()).format("DD/MM/YYYY - HH:mm")}, com a seguinte justificativa: ${req.body.motivoCancelamento}`;
                                    obj.registros.push({data: new Date(), texto: `Reserva cancelada a pedido do responsável, com a seguinte justificativa: ${req.body.motivoCancelamento}`});
                                    obj.save();
                                    var dadosDaReserva = dadosDoEvento(reserva, horarios);
                                    var mensagem = ` <div style="background-color: #f2f2f2; padding: 30px 15px">
                                            <h2>Prezado(a) ${reserva.nomeResponsavel},</h2>
                                            <p>Informamos que seu pedido de reserva abaixo especificado foi cancelado, conforme solicitado.
                                            ${dadosDaReserva}
                                            <p>Caso sejam necessários esclarecimentos, <a href="/faleConosco">favor entrar em contato conosco.</a></p>
                                        </div>
                                    </div>`;

                                    var mailOpts = {
                                        from: `'Reserva de espaços - Decania CCS' <${process.env.USERMAIL}>`,
                                        to: [reserva.emailResponsavel],//TODO: incluir pessoas que devem tomar conhecimento de cancelamentos
                                        subject: "Reserva de espaço cancelada a pedido",
                                        html:  bannerMail + mensagem + rodape
                                    };
                                    mensagem = bannerSite + mensagem;
                                    nodeMailer.sendMail(mailOpts, function(error, response){
                                        if (error) {
                                            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                                        } else {
                                            res.render("sucesso", {mensagem: mensagem, usuario, permissoes});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.post("/manutencao/abrirDS", function(req, res){
    Ds.create({
         solicitante: req.body.solicitante,
         identificacao: `Demanda ${req.body.solicitante}`,
         matricula: req.body.matricula,
         categoria: req.body.categoria,
         unidade: req.body.unidade,
         cargo: req.body.cargo,
         local: req.body.local,
         localTrabalho: req.body.localTrabalho,
         telefone: req.body.telefone,
         email: req.body.email,
         horarios: req.body["horarios-disponiveis-manutencao"],
         descricao: req.body.descricao,
         obs: req.body.obs,
         prioridade: false,
         estado: "aberta",
         eventos: [
             {
                 data: new Date(),
                 texto: `Demanda de serviço criada.`
             }
         ]
    }, function(err, obj){
        if(err){
            criarLogErro(err);
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else{
            var primeiroNome = obj.solicitante.split(" ")[0],
                dadosChamado = dadosDoChamado(obj),
                anexos = [], msgAnexos;
            if (req.files) {
                msgAnexos = nodeMailerAnexos(req.files, anexos, "");
            } else {
                msgAnexos = "";
            }     
            for(let i = 0; i < anexos.length; i++) {
                let extensao = anexos[i].filename.split('.').pop(), formato;  
               if(extensao === 'jpg' || extensao === 'jpeg' || extensao === 'png' ) {
                    extensao === 'jpg' || extensao === 'jpeg' ? formato = 'jpeg' : formato = 'png';
                   sharp(anexos[i].content)
                   .resize(500, 500)
                   .max()
                   .toFormat(formato)                    
                   .toFile(`public/img/manutencao/${moment(new Date()).format("YYYY-MM-DD")}_${obj._id}_${i}.${extensao}`, function(err, info) {
                       if(err) {
                           res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                       }
                   });
                   obj.fotos.push(`${moment(new Date()).format("YYYY-MM-DD")}_${obj._id}_${i}.${extensao}`);
               }
            }
            obj.save();
            var mailOpts = {
                from: `'Atividades Gerenciais - Decania CCS' <${process.env.USERMAIL}>`,
                to: [obj.email, process.env.ATGERENCIAIS_MAIL],
                replyTo: [process.env.ATGERENCIAIS_MAIL],
                subject: `Atualização do status de chamado ${obj._id}`,
                attachments: anexos,
                html: `
                    ${bannerMail}
                    <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555;">
                        <h2>Prezado(a) ${primeiroNome},</h2>
                        <h3>Informamos que o seguinte chamado de manutenção foi criado com sucesso:</h3> <br>
                        <hr>
                        <div style="padding-left: 30px">
                            ${dadosChamado}
                            ${msgAnexos}
                        </div>
                        <hr>
                        <p>Para acompanhar seu trâmite, <a href="http://www.ccs.ufrj.br/manutencao/acompanhar/${obj._id}">clique aqui</a></p>.
                    </div>
                    ${rodape}`
            };
            nodeMailer.sendMail(mailOpts, function(error, response){
                if (error) {
                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                } else {
                    res.render("sucesso", {mensagem: "<p>Enviamos um e-mail com os detalhes do seu chamado de manutenção.</p> ", usuario, permissoes});
                }
            });
        }
    });
});

router.post("/manutencao/deletarDS", urlEncoded, (req,res) => {
    if (req.body.acao === 'eliminar') {
        Ds.findByIdAndRemove(req.body.id, function (err, demanda) {
            if (err) {
                criarLogErro(err);
                res.render('erro', {mensagem: mensagens[0], usuario, permissoes});
            } else {               
                Os.deleteMany({_id: {$in:demanda.os}}, function(err) {
                    if(err) {
                        criarLogErro(err);
                    } else {
                        res.json('<h2>Demanda eliminada</h2>');
                    }
                });
            }
        });
    } else if (req.body.acao === 'arquivar') { 
        Ds.findById(req.body.id, (err, demanda) => {            
            demanda.dataFinalizacao = new Date();
            demanda.eventos.push({data: new Date(), texto: `Demanda finalizada por ${req.user.nome}`});
            demanda.estado = 'fora de escopo';
            demanda.save();
            if (err) {
                criarLogErro(err);
            } else {  
                let primeiroNome = demanda.solicitante.split(" ")[0];
                let mailOpts = {
                    from: `'Atividades Gerenciais - Decania CCS' <${process.env.USERMAIL}>`,
                    to: [demanda.email],
                    replyTo: [process.env.ATGERENCIAIS_MAIL],
                    subject: `Atualização de status do chamado ${demanda._id}`,
                    html: `
                        ${bannerMail}
                        <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555;">
                            <h2>Prezado(a) ${primeiroNome},</h2>
                            <h3>Informamos que seu chamado de manutenção foi encerrado, uma vez que a demanda apresentada não se encontra no escopo dos serviços prestados pelas oficinas de manutenção do CCS.</h3>
                            <h3>Colocamo-nos à disposição para eventuais esclarecimentos através de nossa <a href='http://www.ccs.ufrj.br/faleConosco'>central de comunicação</a>, opção 'outros'. Se preferir, <a href='mailto: andre.atgerenciais@ccsdecania.ufrj.br'>envie-nos um e-mail.</a> </h3>
                        </div>
                        ${rodape}`
                };
                nodeMailer.sendMail(mailOpts, function(error, response){
                    if (error) {
                        res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                    } else { 
                        res.json("<h3>Demanda fora de escopo movida para a seção de concluídas</h3>");
                    }
                });
            }            
        });
    }
});

router.post("/manutencao/editarDS", urlEncoded, function(req, res) {
    Ds.findById(req.body.id, function(err, demanda) {
        if (err) {
        criarLogErro(err);
        } else {
            demanda.identificacao = req.body.identificacao;
            demanda.prioridade = req.body.prioridade;
            demanda.save();
            res.redirect("/manutencao/gerenciar");
        }
    });
});

router.post("/manutencao/abrirOS", function(req, res){
    //cria uma variável Date no primeiro dia do mês atual
    var dataInicial = new Date();
    dataInicial.setDate(1);
    dataInicial.setHours(0,0,0,0);
    let mesCorrigido = `0${dataInicial.getMonth() + 1}`.slice(-2);
    let idOS = `${req.body.oficina.toUpperCase().substr(0,3).normalize('NFD').replace(/[\u0300-\u036f]/g, "")}${dataInicial.getFullYear()}${mesCorrigido}-`;
    
    Os.find({dataAbertura: {$gte: dataInicial}, oficina:req.body.oficina}).sort({dataAbertura: -1}).limit(1).exec(function(err, os) {
        if (os.length < 1) {
            sequencial = '001';
        } else {
            sequencial = `00${Number(os[0]._id.split('-').pop()) + 1}`.slice(-3);
        }      
        idOS += sequencial;
        Os.create({
            _id: idOS,
            oficina: req.body.oficina,
            encarregado: req.body.encarregado,  
            descricao: 'editar descrição',          
            dataAbertura: new Date(),            
            prioridade: false
        }, function(err, os){
            if(err){
                criarLogErro(err);
                res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
            } else{
                Ds.findById(req.body.idDS, function(err, ds){
                    primeiroNome = ds.solicitante.split(" ")[0];
                    if (err) {
                        criarLogErro(err);
                    } else {
                        ds.os.push(idOS);
                        ds.eventos.push({data: new Date(), texto: `OS código ${idOS} gerada por ${req.user.nome}.`});
                        ds.estado = "em andamento";
                        ds.save();
                        var mailOpts = {
                            from: `'Atividades Gerenciais - Decania CCS' <${process.env.USERMAIL}>`,
                            to: [ds.email],
                            replyTo: [process.env.ATGERENCIAIS_MAIL],
                            subject: `Atualização de status do chamado ${ds._id}`,
                            html: `
                            ${bannerMail}
                            <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555">
                            <h2>Prezado(a) ${primeiroNome},</h2>
                            <p style="padding-left: 30px">Informamos que foi gerada a ordem de serviço código ${idOS}, referente ao chamado de manutenção ${ds._id}. Para acompanhar seu trâmite, <a href="http://www.ccs.ufrj.br/manutencao/acompanhar/${ds._id}">clique aqui.</a></p>
                            </div>
                            ${rodape}`
                        };
                        nodeMailer.sendMail(mailOpts, function(error, response){
                            if (error) {
                                res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                            } else {
                                res.redirect("/manutencao/gerenciar");
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post("/manutencao/editarOS", urlEncoded, function(req, res) {
    Os.findById(req.body._id, function(err, os) {
        if (err) {
        criarLogErro(err);
        } else if (os) {
            os.encarregado = req.body.encarregado;
            os.descricao = req.body.descricao;
            os.obs = req.body.obs;
            if (os.epi) {
                os.epi = req.body.epi;
            }
            os.matNome = req.body["matNome[]"];
            os.matQuant = req.body["matQuant[]"];
            if (req.body.executada !== "neutro" && req.body.executada !== undefined) {
                os.executada = req.body.executada;
                os.executor = req.body.executor;
                os.consideracoes = req.body.consideracoes;
                os.dataFinalizacao = req.body.dataFinalizacao;
                Ds.findById(req.body.idDemanda, function(err, demanda) {
                    if (err) {
                        criarLogErro(err);
                    } else {
                        var executada;
                        (os.executada) ? executada = "concluído" : executada = "não realizado";
                        demanda.eventos.push({data: new Date(), texto: `${req.user.nome} finalizou a ordem de serviço código ${os._id} com o status "serviço ${executada}".`});
                        var textoDsFinalizada = ""
                        if (req.body.dsFinalizada === "true") {
                            demanda.estado = req.body.dsEstado;
                            demanda.dataFinalizacao = new Date();
                            demanda.eventos.push({data: new Date(), texto: `Demanda finalizada por ${req.user.nome}`});
                            textoDsFinalizada +=`
                            <p style="padding-left: 30px">Sendo este o último dos serviços requisitados, o chamado de manutenção de código ${demanda._id} foi finalizado em ${moment(new Date()).format("DD [de] MMMM [de] YYYY")}.</p>`;
                        }
                        primeiroNome = demanda.solicitante.split(" ")[0];
                        var mailOpts = {
                            from: `'Atividades Gerenciais - Decania CCS' <${process.env.USERMAIL}>`,
                            to: [demanda.email],
                            subject: `Atualização de status do chamado ${demanda._id}`,
                            html: `
                            ${bannerMail}
                            <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555">
                            <h2>Prezado(a) ${primeiroNome},</h2>
                            <p style="padding-left: 30px">Informamos que a ordem de serviço código ${os._id} foi finalizada com o status "serviço ${executada}".</p>
                            ${textoDsFinalizada}
                            <hr>
                            <p>Para acompanhar seu trâmite, <a href="http://www.ccs.ufrj.br/manutencao/acompanhar/${demanda._id}">clique aqui.</a></p>
                            <p style="margin-top: 50px">Agradecemos a colaboração e, caso queira manifestar sua opinião sobre esse sistema, solicitamos que utilize nossa <a href="/faleconosco">central de comunicação</a></p>
                            </div>
                            ${rodape}`
                        };
                        nodeMailer.sendMail(mailOpts, function(error, response){
                            if (error) {
                                criarLogErro(error);
                            }
                        });
                    }
                    demanda.save();
                });
            }
            os.save();            
        }
        res.json({message:req.body.idDemanda});
    });
});

router.post("/manutencao/deletarOS", urlEncoded, (req, res) => {
    Ds.findById(req.body.idDemanda).populate("os").exec(function(err, ds){
        if (err) {
            criarLogErro(`Erro ao encontrar o ID para da DS para deletar a ordem: ${err}`);
        } else {
            for (let i = 0; i < ds.os.length; i++) {
                if (ds.os[i]._id === req.body.idOrdem) {
                    ds.os.splice(i, 1);
                    break;
                }
            }
            Os.findByIdAndRemove(req.body.idOrdem, function(err, os) {
                if (err) {
                    criarLogErro(`Erro ao encontrar o ID para deletar a ordem: ${err}`);
                } else {
                    if (ds.os.length === 0) {
                        ds.estado = 'aberta';
                        ds.eventos.push({data: new Date(), texto: `Excluída a Ordem de Serviço ${req.body.idOrdem} por ${req.user.nome}.`});
                        ds.save((err, ds) => {
                            err ? criarLogErro(`Erro ao salvar a demanda: ${err}`) : res.json({message:req.body.idDemanda});
                        });

                    } else {                        
                        let emAndamento = false;                           
                        for (let i = 0; i < ds.os.length; i++) { 
                            if (!ds.os[i].dataFinalizacao) {
                                emAndamento = true;
                                ds.eventos.push({data: new Date(), texto: `Excluída a Ordem de Serviço ${req.body.idOrdem} por ${req.user.nome}.`});
                                ds.save((err, ds => {
                                    err ? criarLogErro(`Erro ao salvar a demanda: ${err}`) : res.json({message:req.body.idDemanda});
                                }));
                            }
                        }
                        if (!emAndamento) {
                            ds.eventos.push({data: new Date(), texto: `Excluída a Ordem de Serviço ${req.body.idOrdem} por ${req.user.nome}.`});
                            let mailOpts = deletarOsEncerrarDs(req, ds, bannerMail);
                            nodeMailer.sendMail(mailOpts, function(error, response){
                                if (error) {
                                    criarLogErro(error);
                                } else {
                                   
                                    ds.save((err, ds => {
                                        err ? criarLogErro(`Erro ao salvar a demanda: ${err}`) : res.json({message:req.body.idDemanda});
                                    }));
                                }
                            });
                        }
                    }
                }
            });      
        }
    });
    
});

router.post("/logAdm", urlEncoded, function(req, res) {
    Ds.findById(req.body.id, function(err, demanda) {
        if (err) {
            criarLogErro(err);
        } else {
            demanda.eventos.push({data: new Date(), texto: req.body.mensagem});
            demanda.save();            
            var mailOpts = {
                from: `'Atividades Gerenciais - Decania CCS' <${process.env.USERMAIL}>`,
                to: [demanda.email, process.env.ATGERENCIAIS_MAIL],
                subject: "Atualização do status de chamado",            
                html: `
                    ${bannerMail}
                    <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555;">
                        <h2>Prezado(a) ${demanda.solicitante.split(" ")[0]},</h2>
                        <h3>Informamos que há um novo comunicado sobre a demanda de serviço de nº ${demanda._id}:</h3> <br>
                        <hr>
                        <div style="padding-left: 30px">
                            <h3>"${req.body.mensagem}"</h3>
                        </div>
                        <hr>
                        <p>Para acompanhar o trâmite desta demanda, na íntegra, <a href="http://www.ccs.ufrj.br/manutencao/acompanhar/${demanda._id}">clique aqui</a></p>.
                    </div>
                    ${rodape}`
            };
            nodeMailer.sendMail(mailOpts, function(error, response) {
                if (error) {
                    res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
                } else {
                    res.json({"status": "mensagem registrada no histórico da demanda"});
                }
            });            
        }
    });
});

router.post("/reportarProblema", function(req, res){
    let nome, email
    req.body.nome ? nome = req.body.nome : nome = "";
    req.body.email ? email = req.body.email :email = "";

    var mailOpts = {
        from: `'Webdev - Decania CCS' <${process.env.USERMAIL}>`,
        to: process.env.USERMAIL, //e-mail para a equipe de webdev
        subject: "Relato de problemas",
        replyTo: req.body.email,
        html: `${nome} - ${email} escreveu: 
        ${req.body.reportarProblema}`
    };

    var anexos = [];

    var mensagem = `
        <div class="mensagem">
        <h2> Agradecemos sua colaboração para aprimorarmos os canais digitais de comunicação da Decania do CCS.</h2>
        <div>
            <p><strong>Problema relatado:</strong></P>
            <P>${req.body.reportarProblema}</p>`;
    if (req.files.anexoProblema) {
        mensagem += `<p><strong>Arquivos:</strong></p>`;
        anexos.push({filename: req.files.anexoProblema.name, content: new Buffer(req.files.anexoProblema.data, req.files.anexoProblema.encoding)});
        mensagem += `<p class="arquivos">${req.files.anexoProblema.name}</p>`;
        mailOpts.attachments = anexos;
    }
    mensagem += `</div></div>`;

    nodeMailer.sendMail(mailOpts, function(error, response){
        if (error){
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else {
            res.render("sucesso", {mensagem, usuario, permissoes});
        }
    });
});

router.post("/outros", urlEncoded, function(req, res){    
    console.log(req.body);
    var mailOpts = {
        from: `'Webdev - Decania CCS' <${process.env.USERMAIL}>`,
        to: [process.env.USERMAIL, process.env.ASCOMMAIL],//e-mail para a equipe de webdev
        replyTo: req.body.emailOutros,
        subject: `Assuntos diversos - contato de ${req.body.name}`,
        html: `${req.body.name} - ${req.body.emailOutros} escreveu: 
        ${req.body.bodyOutros}`
    };
    var mensagem = `
        <div class="mensagem">
        <h2> Agradecemos sua colaboração para aprimorarmos os canais digitais de comunicação da Decania do CCS.</h2>
        <div>
            <p><strong>Mensagem enviada:</strong></P>
            ${req.body.bodyOutros}`;    
    mensagem += `</div></div>`;

    nodeMailer.sendMail(mailOpts, function(error, response){
        if (error){
            res.render("erro", {mensagem: mensagens[0], usuario, permissoes});
        } else {
            res.render("sucesso", {mensagem, usuario, permissoes});
        }
    });
});


module.exports = router;
