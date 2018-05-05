"use strict";
const express = require("express"),
      router = express.Router(),
      bodyParser = require("body-parser"),
      moment = require("moment"),
      mongoose = require("../mongoose"),
      moduloAsync = require("async"),

//meus módulos
      resultadoBusca = require("../myModules/resultadoBusca"),
      criarLogErro = require("../myModules/rotinasAutomatizadas").criarLogErro,
      //moverChamados = require("../myModules/rotinasAutomatizadas").moverChamados,

//meus modelos
      Reserva = require ("../models/modeloReserva"),
      Auditorio = require ("../models/modeloAuditorio"),
      Slide = require ("../models/modeloSlide"),
      Conteudo = require ("../models/modeloConteudo"),
      Contato = require ("../models/modeloContato"),
      Ds = require ("../models/modeloDS"),
      DsConcluida = require ("../models/modeloDsConcluida"),
      Documento = require ("../models/modeloDocumento");


//////////////////////////////////////////
/////////////// VARIABLES ////////////////
//////////////////////////////////////////

var urlEncoded = bodyParser.urlencoded({extended:false});

moment.locale("pt-br");

var jaAutenticado = function(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.render('login', {
    message: `<h2>Autenticação necessária para acessar este sistema.</h2>`,
    urlDestino: req.originalUrl
  });
}

var mensagens = [
    "<h2>Página não encontrada. Por favor, verifique o endereço informado.</h2>",
    `<h2>Você não tem permissão para acessar essa página.</h2>`
];

var usuario, permissoes = [];

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

router.get("/", function(req, res){
    console.log("remote Adress é: ", req.connection.remoteAddress);
    res.render("index", {usuario, permissoes});
});

//rota para recuperar os conteúdos dinâmicos da página index.hbs
router.get("/recuperarIndex", function(req, res){
    var queries = [];
    queries.push(function(cb){
        Conteudo.find({ $and:[{$or:[ {natureza:"noticia"}, {natureza:"evento"}, {natureza:"informe"} ]}/* , { data: { $gte: moment(new Date()).subtract(30, "days").format('YYYY-MM-DD') } } *//*, { tag: { $nin:["destaque"]}}*/] }).sort({data: -1}).limit(8).exec(function(err, ultimasNoticias){
            if (err) {
                res.render("erro", {mensagem: mensagens[0]});
                criarLogErro(err);
            } else {
                cb(null, ultimasNoticias);
            }
        });
    });

    queries.push(function(cb){
        Conteudo.find({ $and:[{$or:[ {natureza:"video"}, {natureza:"foto"}]}, { tag: { $in:["destaque"]}}] }).sort({data: -1}).limit(18).exec(function(err, multimidia){
            if (err) {
                res.render("erro", {mensagem: mensagens[0]});
                criarLogErro(err);
            } else {
                cb(null, multimidia);
            }
        });
    });

    queries.push(function(cb){
        Slide.find({}, function(err, slides) {
            if (err) {
                res.render("erro", {mensagem: mensagens[0]});
            } else {
                cb(null, slides);
            }
        });
    });

    queries.push(function(cb){
        Conteudo.find({ $and:[{$or:[ {natureza:"noticia"}, {natureza:"evento"}, {natureza:"informe"} ]}, /* {$or:[ {data: { $gte: moment(new Date()).subtract(45, "days").format('YYYY-MM-DD') }}, { tag: { $in:["fixo"]}}]}, */ { tag: { $in:["destaque"]}}]}).sort({data: -1}).limit(5).exec(function(err, destaque) {
            if (err) {
                res.render("erro", {mensagem: mensagens[0]});
                criarLogErro(err);
            } else {
                cb(null, destaque);
            }
        });
    });

    moduloAsync.parallel(queries, function(err, results) {
        res.json(results);
    });
});

//localizar contatos
router.get("/contatos/localizar", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("contatos_localizar", {usuario, permissoes});
});

//inserir contatos
router.get("/contatos/inserir", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("contatos_inserir", {usuario, permissoes});
});

//editar contatos
router.get("/contatos/editar/:id", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("contatos_editar", {usuario, permissoes, id: req.params.id});
});

//rota para localizar contato específico via ajax
router.get("/recuperarContatoPorId", function(req, res){
    Contato.findById(req.query.id, function(err, contato){
        if (err) {
           res.end("erro");
        } else {
            res.json(contato);
        }
    });
});

//rota para localizar contatos via ajax
router.get("/recuperarContatos", function(req, res){
    var query = [];
    var queryObject = {}
    if (req.query.termos) {
        query.push(req.query.termos)
    }
    if (req.query.reservarAuditorios) {
        query.push(req.query.reservarAuditorios);
    }
    if (req.query.analisarReservaAuditorios) {
        query.push(req.query.analisarReservaAuditorios);
    }
    if (req.query.gerenteSistema) {
        query.push(req.query.gerenteSistema);
    }
    if (req.query.chefeManutencao) {
        query.push(req.query.chefeManutencao);
    }
    if (query.length !== 0) {
        queryObject = {$and:query}
    }

    Contato.find(queryObject).sort({nome: 1}).exec(function(err, contatos){
        if (err) {
           res.end("erro");
        } else {
            res.json(contatos);
        }
    });
});

//rota para recuperar reservas via ajax
router.get("/recuperarReservas", function(req, res){
    let query = {};
    if (req.query) {query = req.query};
    Reserva.find(query, function(err, todasAsReservas){
        if (err) {
           res.end("erro");
        } else {
            res.json(todasAsReservas);
        }
    });
});

//rota para recuperar horários de reservas via ajax
router.get("/recuperarHorarios", function(req, res){
    Reserva.find({}, { horarios : 1, _id: 1, status : 1, auditorio: 1 }, function(err, todasAsReservas){
        if (err) {
           res.end("erro");
        } else {
            res.json(todasAsReservas);
        }
    });
});

//rota para recuperar conteúdos via ajax
router.get("/recuperarConteudo", function(req,res){
    var query = [],
        filtros = {},
        queryObject = {},
        destaque;

    if (req.query.termos) {
        query.push(req.query.termos);
    }
    if (req.query.filtros) {
        filtros = {$or: req.query.filtros}
        query.push(filtros);
    }
    if (req.query.destaque !== "false") {
        destaque = {tag: "destaque"}
        query.push(destaque);
    }

    if (req.query._id) {
        Conteudo.findById(req.query._id, function(err, conteudo){
            if(err) {
                res.end("erro");
            } else {
                res.json(conteudo);
            }
        });
    } else {
        if (query.length !== 0) {
            queryObject = {$and:query}
        }
        Conteudo.find(queryObject, function(err, conteudo){
            if(err){
                res.end("erro");
            } else{
                res.json(conteudo);
            }
        });
    }
});

//rota para editar conteúdos
router.get("/conteudos/editar/:id", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("conteudos_editar", {usuario, permissoes, id: req.params.id, tinyMCE: true});
});

//rota ajax para recuperar documentos de conteúdos
router.get("/conteudos/recuperarDocs", function(req, res){
    Documento.find({pagina: req.query.pagina}, function(err, docs) {
        res.json(docs);   
    });
});

//rota para recuperar o conteúdo Equipe via ajax
router.get("/recuperarEquipe", function(req, res) {
    var _equipe = req.query.grupos;
    Contato.find({grupos:{$in: [_equipe]}}, function(err, equipe){ 
        if (err || equipe === null) {
            res.render("erro", {
                mensagem: mensagens[0]
            });
        } else {
            res.json(equipe);
        }
    });
});

router.get("/faleConosco", function(req, res){
    res.render("faleConosco", {
        usuario, permissoes, tinyMCE:true
    });
});

router.get("/reserva", jaAutenticado, function(req, res){
    if(!req.user.permissoes.reservarAuditorios){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }

    Auditorio.find({}, null, {sort: {nome: 1}}, function(err, auditorios){
       if (err || auditorios.length === 0) {
           res.render("erro", {
               mensagem: mensagens[0]
           });
       } else {
           res.render("auditorios", {
               auditorios,
               usuario, permissoes
           });
       }
    });
});

router.get("/reserva/analise/requisicoes", function(req, res) {    
    var queries = [];
    queries.push(function(cb){
        Reserva.find({status: "requisitado"}, function(err, requisicoes){
            if (err) {
               res.render("erro", {
                   mensagem: mensagens[0],
                   usuario: req.user.nome,
                   permissoes
               });
            } else {
                cb(null, requisicoes);
            }
        });
    });
    queries.push(function(cb){
        Reserva.find({status: "agendado"}, function(err, aprovados){
           if (err) {
               res.render("erro", {
                   mensagem: mensagens[0],
                   usuario: req.user.nome,
                   permissoes
               });
            } else {
                cb(null, aprovados);
            }
        });
    });
    moduloAsync.parallel(queries, function(err, results) {
        if (err) {
            req.render('erro', {mensagem: err});            
        }                
        res.json(results);
    });
}); 



router.get("/reserva/analise", jaAutenticado, function(req, res){
    if(!req.user.permissoes.analisarReservaAuditorios){
        res.render("erro", {mensagem: mensagens[1], usuario, permissoes});
        return;
    }
    res.render("reservaAnalise", {
        //requisicoes,
        //aprovados,
        usuario,
        permissoes,
        analisePedidos: "yes"
    });
});

router.get("/reserva/mapaSemana", jaAutenticado, function(req, res){
    res.render("reservaMapaSemana", {usuario, permissoes});
});
router.get("/reserva/mapaDia", jaAutenticado, function(req, res){
    res.render("reservaMapaDia", {usuario, permissoes});
});

router.get("/reserva/:id", jaAutenticado, function(req, res){
    Auditorio.findById(req.params.id, function(err, auditorio){

        if (err || auditorio === null) {
            res.render("erro", {
                mensagem: mensagens[0],
                usuario: req.user.nome,
                permissoes
            });
        } else {
            res.render("reserva", {
                auditorio,
                usuario, permissoes
            });
        }
    });
});

//recuperar espaços auditório via  AJAX
router.get("/recuperarAuditorios", function(req, res){
    Auditorio.find({}, function(err, auditorios){
        err ? criarLogErro(err) : res.json(auditorios); 
    });
});

//recuperar reservas auditório via  AJAX
/* router.get("/recuperarReservasAuditorio", jaAutenticado, function(req, res){
    Reserva.find(req.query, function(err, reservas){
        err ? criarLogErro(err) : res.json(reservas);        
    });
}); */


router.get("/reserva/cancelar/:id", function(req, res){
    res.render("cancelarReserva", {
        idReserva: req.params.id,
        usuario, permissoes
    });
});

router.get("/conteudos/localizar", jaAutenticado, function(req,res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("conteudos_localizar", {
        usuario, permissoes
    });
});

router.get("/conteudos/inserir", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("conteudos_inserir", {
        usuario, permissoes,
        tinyMCE: true
    });
});

router.get("/conteudos/inserir/multimidia", jaAutenticado, function(req, res){
    if(!req.user.permissoes.gerenteSistema){
        res.render("erro", {mensagem: `<h2>${req.user.nome},</h2> `+mensagens[1], usuario, permissoes});
        return;
    }
    res.render("multimidia_inserir", {
        usuario, permissoes,
        inserirConteudo: true
    });
});

//
router.get("/conteudos/:nome", function(req, res){
    //lista de páginas pendentes ou em construção
    var emConstrucao = ["pendente", "relatorioGestao", "camaraHospitais", "qualidadeSeguranca", "inovacao", "saudeGlobal", "residencia", "incts", "posDoutorandos", "projetosExtensao", "sigproj"];
    for(let i=0; i<emConstrucao.length; i++){
        if(req.params.nome === emConstrucao[i]){
            res.render("erro", {
                mensagem: "<h2>Essa página está em construção.</h2>"
            });
            return;
        }
    }

    Conteudo.findById(req.params.nome, function(err, conteudo){
        if (err || conteudo === null) {
            res.render("erro", {
                mensagem: mensagens[0]
            });
        } else {
            let img;
            conteudo.imagem ? img = true : img = false;
            res.render("conteudo", {
                img,
                conteudo,
                url: req.originalUrl,
                usuario, permissoes
            });
        }
    });
});

//página de consulta a conteúdos, acessados pelo botão "leia mais"
router.get("/busca/:indexInicio", urlEncoded, function(req, res){
    res.render("resultadoBusca", {usuario, permissoes});
});

//recuperar consulta a conteúdos via AJAX
router.get("/recuperarBusca", function(req, res){
    var opcoes = JSON.parse(req.query.opcoes);
    Conteudo.paginate(req.query.filtro, opcoes, function(err, resultados) {
        if (err) {
            criarLogErro(err);
            res.render("erro", {mensagem: "Ocorreu um erro em sua requisição. Favor tentar novamente, ou <a href='/faleConosco'>entre em contato conosco</a>"});
        } else {
            var paginacao = resultadoBusca(resultados.docs, resultados.total, resultados.pages, resultados.limit, req.query.quantidadeNumerosPagina, req.query.paginaAtual);
            res.json({resultados, paginacao});
        }
    });
});

//Rota especial para renderizar a página da equipe da decania
router.get("/equipeDecania", function(req, res){
    res.render("equipeDecania", {usuario, permissoes});
});

//rota para exibir o formulário de abertura de chamados de manutenção
router.get("/manutencao", function(req, res){
    res.render("manutencaoDS_abrir", {usuario, permissoes});
});

//rota para editar um chamado de manutenção existente
router.get("/manutencao/editar/DS/:id", jaAutenticado, function(req, res){
    if(!req.user.permissoes.chefeManutencao){
        res.render("erro", {mensagem: mensagens[1], usuario, permissoes});
        return;
    }
    res.render("manutencaoDS_editar", {usuario, permissoes, readonly: "readonly"});
});

//Rota para o gerenciador de chamados de manutenção
router.get("/manutencao/gerenciar", jaAutenticado, function(req,res){
    if(!req.user.permissoes.chefeManutencao){
        res.render("erro", {mensagem: mensagens[1], usuario, permissoes});
    }
    res.render("manutencaoGerenciador", {usuario, permissoes});
});

//rota para o usuário acompanhar o andamento de um chamado de manutenção
router.get("/manutencao/acompanhar/:id", function(req, res){
    Ds.findById(req.params.id, function(err,obj) {
        if (err) {
            res.render("erro", {mensagem: "<h2>Não foi encontrada Demanda de serviço com o número de identificação informado</h2>"})
        } else {
            res.render("manutencaoAcompanhar", {usuario, permissoes});
        }
    });
});

//rota para as requisições AJAX de chamados de manutenção
router.get("/recuperarDS", function(req, res){
    var intervaloAno = {$gte: new Date(req.query.ano, 0), $lt: new Date(Number(req.query.ano) + 1, 0)};
    switch(req.query.tipo){
        case "resumo":
            Ds.find(req.query.estadoResumo, { descricao: 1, solicitante : 1, prioridade: 1, estado:1, identificacao:1, os:1 }, function(err, ds) {
                err ? res.end("erro") : res.json(ds);
            });
            break;
        case "completa":
            Ds.findById(req.query.id).populate("os").exec(function(err, ds){
                err ? res.end("erro") : res.json(ds);
            });
            break;
        case "estatisticas":
            Ds.find({}, { categoria: 1, estado:1, os:1, unidade:1 }).populate("os").exec(function(err, ds) {
                err ? res.end("erro") : res.json(ds);
            });
            break;
        case "resumoConcluidas":
            DsConcluida.find({ "eventos.0.data": intervaloAno }, { descricao: 1, solicitante : 1, prioridade: 1, estado:1, identificacao:1, os:1 }, function(err, ds) {
                err ? res.end("erro") : res.json(ds);
            });
            break;
        case "completaConcluidas":
            DsConcluida.findById(req.query.id).populate("osConcluida").exec(function(err, ds){
                err ? res.end("erro") : res.json(ds);
            });
            break;
        case "estatisticasConcluidas":
            DsConcluida.find({ "eventos.0.data": intervaloAno }, { categoria: 1, estado:1, os:1, unidade:1 }).populate("osConcluida").exec(function(err, ds) {
                err ? res.end("erro") : res.json(ds);
            });
            break;
    }
});

//Rota para criar uma nova ordem de serviço em um chamado de manutenção
router.get("/manutencao/novaOS/:id", urlEncoded, jaAutenticado, function(req,res){
    if(!req.user.permissoes.chefeManutencao){
        res.render("erro", {mensagem: mensagens[1], usuario, permissoes});
        return;
    }
    res.render("manutencaoOS_abrir", {id: req.params.id, usuario, permissoes});
});

router.get("/liveVideo", function(req, res){
    res.render("liveVideo");
});
//Rota para o gerenciador de chamados de manutenção
router.get("/liveStream", function(req,res){  
    Conteudo.find({liveVideo: true}).sort({dataDeExibicao: -1}).exec((err, video) => {
        res.json(video);
    });   
});

router.get("/sucesso", function(req, res){
    res.render("sucesso", {usuario, permissoes});
});
router.get("/erro", function(req, res){
    res.render("erro", {usuario, permissoes});
});


router.get("*", function(req, res){
    res.status(400);
    res.render("erro", {
        mensagem: mensagens[0],
        usuario, permissoes
    });
});

module.exports = router;
