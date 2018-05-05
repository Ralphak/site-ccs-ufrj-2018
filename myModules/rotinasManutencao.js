const moment = require("moment");

let deletarOsEncerrarDs = (req, ds, bannerMail) => {
    let todasExecutadas = true, todasNaoExecutadas = true;                            
    for (let i = 0; i < ds.os.length; i++) {        
        if (ds.os[i].dataFinalizacao && !ds.os[i].executada) {
            todasExecutadas = false;            
        } 
        if (ds.os[i].executada) {
            todasNaoExecutadas = false;            
        }                    
    }
    if (todasExecutadas) {
        ds.estado = 'atendida'
    } else if (todasNaoExecutadas){
        ds.estado = 'não atendida'
    } else {
        ds.estado = 'atendida parcialmente'
    }                                                       
    var textoDsFinalizada = "";     
    ds.dataFinalizacao = new Date();
    ds.eventos.push({data: new Date(), texto: `Demanda de Serviço finalizada por ${req.user.nome}`});
    
    textoDsFinalizada +=`
    <p>Informamos que o chamado de manutenção de código ${ds._id} foi finalizado em ${moment(new Date()).format("DD [de] MMMM [de] YYYY")}.</p>`; 
    primeiroNome = ds.solicitante.split(" ")[0];
    var mailOpts = {
        from: `'Atividades Gerenciais - Decania CCS' <${process.env.ATGERENCIAIS_MAIL}>`,
        to: [ds.email],
        replyTo: `'Atividades Gerenciais - Decania CCS' <${process.env.ATGERENCIAIS_MAIL}>`,
        subject: `Atualização de status do chamado ${ds._id}`,
        html: `
        ${bannerMail}
        <div style="background-color: #f2f2f2; padding: 30px; font-size: 1.2em;color: #555">
        <h2>Prezado ${primeiroNome},</h2>
        ${textoDsFinalizada}
        <hr>                                
        <p style="margin-top: 50px">Agradecemos a colaboração e, caso queira manifestar sua opinião sobre esse sistema, ou esclarecer quaisquer dúvidas sobre o encerramento de sua demanda, solicitamos que utilize nossa <a href="/faleconosco">central de comunicação</a></p>
        </div>`
    };
    return mailOpts;
};

module.exports = {
    deletarOsEncerrarDs
}