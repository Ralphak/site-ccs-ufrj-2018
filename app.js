
//////////////////////////////////////////
/////////////// CONSTANTS ////////////////
//////////////////////////////////////////

const express = require("express"),
      expressSession = require("express-session"),
      hbs = require("hbs"),
      fileUpload = require("express-fileupload"),
      mongoose = require("./mongoose"),
      passport = require("passport"),
      flash = require("connect-flash"),
      schedule = require("node-schedule"),
      compression = require('compression'),
      //meus módulos
      limparReservasAuditorio = require("./myModules/rotinasAutomatizadas").limparReservasAuditorio,
      moverChamados = require("./myModules/rotinasAutomatizadas").moverChamados,

      //requerendo rotas:
      getRoutes = require("./routes/getRoutes"),
      postRoutes = require("./routes/postRoutes"),
      loginRoutes = require("./routes/loginRoutes");
//////////////////////////////////////////
/////////////// VARIABLES ////////////////
//////////////////////////////////////////

//setando variáveis ambientais
require("dotenv").config({path:"variables.env"});

var app = express();

//certificado SSL
/*var credentials = {
    key: fs.readFile('./diversos/key.pem', 'utf8'),
    cert: fs.readFile('./diversos/cert.pem', 'utf8')
};*/

//////////////////////////////////////////
///////////////// SETUP //////////////////
//////////////////////////////////////////

app.set('view engine', 'hbs');

//compressão do site
app.use(compression());

app.use(express.static(__dirname + "/public"));
hbs.registerPartials(__dirname + "/views/partials");

//configurações de transferência de arquivos
app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    safeFileNames: true,
    preserveExtension: 4
}));


//inicialização do flash (deve vir antes do passport!)
app.use(flash());

//inicialização do passport
app.use(expressSession({secret: 'minhaChaveSecreta'}));
app.use(passport.initialize());
app.use(passport.session());

//realização de manutenção programada
schedule.scheduleJob({hour: 3}, limparReservasAuditorio);
schedule.scheduleJob({month: 11, date: 31, hour: 23}, moverChamados);

//as rotas devem vir após o setup de todos os middlewares!
app.use(loginRoutes);
app.use(getRoutes);
app.use(postRoutes);

//////////////////////////////////////////
////////////// INIT SERVER ///////////////
//////////////////////////////////////////
const port = process.env.PORT || 80;
//https.createServer(credentials, app).listen(port, function(){
app.listen(port, function(){
    console.log(`Servidor site Decania iniciado e escutando na porta ${port}`);
});
