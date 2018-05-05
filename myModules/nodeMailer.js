
const /*fs = require("fs"),*/
      nodeMailer = require("nodemailer");

var smtpTrans = nodeMailer.createTransport({
    service: 'Gmail',
    host: "smtp@gmail.com",
    auth: {
        user: process.env.USERMAIL,
        pass: process.env.USERPASS,
    }
});

var anexos = function(reqFiles, array, msg) {
    if (reqFiles.anexo) {
        msg += `<p><strong>Arquivos:</strong></p>`;
        if (reqFiles.anexo.length >= 1) {
            for (let i = 0; i < reqFiles.anexo.length; i++) {
                array.push({filename: reqFiles.anexo[i].name, content: new Buffer(reqFiles.anexo[i].data, reqFiles.anexo[i].encoding)});
                msg += `<p class="arquivos">${reqFiles.anexo[i].name}</p>`;
            } 
        } else {
            array.push({filename: reqFiles.anexo.name, content: new Buffer(reqFiles.anexo.data, reqFiles.anexo.encoding)});
            msg += `<p class="arquivos">${reqFiles.anexo.name}</p>`;
        }
        return msg;
    }
};

module.exports = {
    smtpTrans,
    anexos
};
