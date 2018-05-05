const passport = require("passport"),
      LocalStrategy = require('passport-local').Strategy,
      bcrypt = require('bcrypt'),

      //meus modelos
      Contato = require("../models/modeloContato");


passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  Contato.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'senha',
    passReqToCallback : true
  },
  function(req, username, password, done) {
    // verifica no mongo se o nome de usuário existe ou não
    Contato.findOne({ 'email' : username }, function(err, user) {
        // Em caso de erro, retorne usando o método done
        if (err){
          console.log("Erro no login:");
          return done(err);
        }
        // Nome de usuário não existe, logar o erro & redirecione de volta
        if (!user){
          console.log('Usuário não encontrado para usuário '+username);
          return done(null, false,
                req.flash('message', '<h2>Usuário não encontrado.</h2>'));
        }
        //Senha não existe para o usuário informado
        if(!user.senha){
            console.log('Senha inexistente para usuário '+username);
            return done(null, false,
                  req.flash('message', '<h2>Senha inexistente. Para gerar uma nova senha, clique em "Esqueci minha senha" abaixo.</h2>'));
        }
        // Usuário existe mas a senha está errada, logar o erro
        if (!bcrypt.compareSync(password, user.senha)){
          console.log('Senha Inválida');
          return done(null, false,
              req.flash('message', '<h2>Senha Inválida</h2'));
        }
        // Tanto usuário e senha estão corretos, retorna usuário através
        // do método done, e, agora, será considerado um sucesso
        console.log("logado como", user.nome);
        return done(null, user);
      }
    );
}));
