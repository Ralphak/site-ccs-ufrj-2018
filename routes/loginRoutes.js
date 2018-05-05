const express = require("express"),
      router = express.Router(),
      bodyParser = require("body-parser"),
      passport = require("passport"),
      bcrypt = require('bcrypt'),
      randomstring = require("randomstring"),

      //meus modelos
      Contato = require("../models/modeloContato"),

      //meus módulos
      login = require("../myModules/login"),
      nodeMailer = require("../myModules/nodeMailer").smtpTrans;

//////////////////////////////////////////
/////////////// VARIAVEIS ////////////////
//////////////////////////////////////////

var urlEncoded = bodyParser.urlencoded({extended:false});

var jaAutenticado = function(req,res,next){
	if(req.isAuthenticated()){
		res.render("erro", {mensagem: "<p>Usuário já autenticado<p>", usuario, permissoes});
	}
	else next();
}

var saltRounds = 10;

var formularioSenhaNova = `
        <h2>Alteração de senha</h2>
        <div>
            <label for="senhaAtual"><p>Senha Atual:</p></label>
            <input type="password" name="senhaAtual" id="senhaAtual" required>
        </div>
        <div>
            <label for="senhaNova"><p>Nova senha:</p></label>
            <input type="password" name="senhaNova" id="senhaNova" required>
        </div>
        <div>
            <label for="senhaConfirma"><p>Confirme a nova senha:</p></label>
            <input type="password" name="senhaConfirma" id="senhaConfirma" required>
        </div>`,
    formularioSenhaTemp = `
        <h2>Envio de senha temporária</h2>
        <div>
            <label for="email"><p>E-mail:</p></label>
            <input type="email" name="email" id="email" required>
        </div>`;

var usuario, permissoes = [];

var bannerMail = `<div style="max-width:800px; margin: 0 auto 0 auto; padding: 0; border: 1px solid #ccc" class="mensagem">
    <a target="_blank" href="http://www.ccs.ufrj.br"><img src="http://www.ccs.ufrj.br/img/banner.jpg"></a>`;

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

/* Requisição GET para página de LOGIN. */
router.get('/login', jaAutenticado, function(req, res) {
	// Mostra a página de Login com qualquer mensagem flash, caso exista
	res.render('login', { message: req.flash('message') });
});

/* Requisição POST para LOGIN */
router.post('/login', urlEncoded, passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash : true
}), function(req,res){
    if (req.body.urlDestino) {
        res.redirect(req.body.urlDestino);
    } else {
        res.redirect("/");
    }
});

//Requisição GET para alterar a senha do usuário
router.get('/alterarsenha', function(req, res) {
    //Abre um campo para escolher uma nova senha
    if(req.isAuthenticated()){
        res.render('alterarSenha', { formulario: formularioSenhaNova, message: req.flash('message'), usuario, permissoes});
    }
    //Abre um campo para receber uma senha temporária via email
    else{
        res.render('alterarSenha', { formulario: formularioSenhaTemp, message: req.flash('message')});
    }
});

//Requisição POST para alterar a senha do usuário
router.post('/alterarsenha', urlEncoded, function(req, res) {
    //Confirma a alteração da senha
    if(req.isAuthenticated()){
        if(!bcrypt.compareSync(req.body.senhaAtual, req.user.senha)){
            req.flash('message', '<h2>Senha atual inválida</h2>');
            res.redirect('/alterarsenha');
        }
        else if(req.body.senhaNova !== req.body.senhaConfirma){
            req.flash('message', '<h2>As senhas novas não conferem</h2>');
            res.redirect('/alterarsenha');
        }
        else{
            Contato.findById(req.user.id, function(err, user){
                bcrypt.hash(req.body.senhaNova, saltRounds, function(err, hash){
                    user.senha = hash;
                    user.save();
                });
            })
            res.render("sucesso", {mensagem: "<h2>Senha alterada com sucesso!</h2>", usuario, permissoes});
        }
    }
    //Envia uma senha temporária por email
    else{
        Contato.findOne({ 'email' : req.body.email }, function(err, user) {
            if (!user){
                req.flash('message', '<h2>Usuário não encontrado.</h2>');
                res.redirect('/alterarsenha');
            }
            else{
                var senhaTemp = randomstring.generate(8);
                bcrypt.hash(senhaTemp, saltRounds, function(err, hash){
                    user.senha = hash;
                    user.save();
                });
                var mailOpts = {
                    from: `'Alteração de senha - Decania CCS' <${process.env.USERMAIL}>`,
                    to: [req.body.email],
                    subject: "Senha temporária de acesso",
                    html: `
                        ${bannerMail}
                        <div style="background-color: #f7f7f7; padding: 30px 15px">
                            <h2>Prezado ${user.nome},</h2>
                            <p>Segue abaixo a sua nova senha de acesso:</a></p> <br>
                            ${senhaTemp}
                            <p>Recomendamos fortemente que altere essa senha. Assim que efetuar a autenticação no site, procure pelo link Alterar Senha no rodapé da página.</p>
                            <p>Em caso de dúvidas ou para reportar um problema, <a target="_blank" href="http://www.ccs.ufrj.br/faleConosco">entre em contato conosco.</a>
                        </div>`
                };
                nodeMailer.sendMail(mailOpts, function(error, response){
                    if (error) {
                        res.render("erro", {mensagem: "<h2>Ocorreu um erro em sua requisição. Favor tentar novamente, ou <a href='/faleConosco'>entre em contato conosco</a></h2>"});
                    } else {
                        res.render("sucesso", {mensagem: "<h2>Sua nova senha foi enviada para o seu email.</h2>"});
                    }
                });
            }
        });
    }
});

/* Manipula a saída */
router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
