const moment = require("moment"),
      Reserva = require("../models/modeloReserva"),
      ReservaConcluida = require("../models/modeloReservaConcluida"),
      Ds = require("../models/modeloDS"),
      Os = require("../models/modeloOS"),
      DsConcluida = require("../models/modeloDsConcluida"),
      OsConcluida = require("../models/modeloOsConcluida"),
      Auditorio = require("../models/modeloAuditorio"),
      Erro = require("../models/modeloErro");

var limparReservasAuditorio = function(){
    Reserva.find({ $nor: [{ horarios: { $gte: moment(new Date()).subtract(30, "days").format('YYYY-MM-DD') } }] }, function(err, reserva){
        console.log(reserva);
        if(err) {
        	console.log(err);
        } else if(!reserva){
        	console.log("nenhuma reserva para limpar");
        } else {
            for(let i=0; i < reserva.length; i++){
                let reservaSemId = reserva[i].toObject();
                delete reservaSemId._id;
                ReservaConcluida.create(reservaSemId, function(err, obj){
                    if (err) {
                        console.log(err);
                    } else {
                        //apagar a reserva do auditório
                        Auditorio.findById(obj.auditorio, function (err, auditorio){
                            if (err) {
                                console.log(err);
                            } else {
                                for (let j = auditorio.reservas.length - 1; j >= 0; j--) {
                                    if (auditorio.reservas[j] == reserva[i]) {
                                        auditorio.reservas.splice(j, 1);
                                    }
                                }
                                auditorio.save();

                                //apagar a reserva da coleção reservas:
                                Reserva.remove({_id: reserva[i]}, function(err){
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        obj.registros += `|| Reserva arquivada automaticamente em ${moment(new Date()).format("DD/MM/YYYY - HH:mm")}.`;
                                        obj.save();
                                        console.log("Limpeza bem sucedida!")
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
	});
};

var moverChamados = function() {
    Ds.find({ estado:{$nin: ["em andamento", "aberta"]} }, function(err, demandas){
        for (let i = 0; i < demandas.length; i++) { 
            let demandaSemId = demandas[i].toObject();
            delete demandaSemId._id;            
            DsConcluida.create(demandaSemId, function(err, dsConcluida) {
                if (err) {
                    criarLogErro(err);                    
                } else {
                    Os.find({_id: {$in:demandas[i].os}}, function(err, docs) {
                        if (err) {
                            criarLogErro(err);
                        } else {
                            OsConcluida.insertMany(docs, function(err, ordens) {
                                if (err) {
                                    criarLogErro(err);
                                } else {
                                    Os.deleteMany({_id: {$in:demandas[i].os}}, function(err) {
                                        if(err) {
                                            criarLogErro(err);
                                        } else {
                                            Ds.findByIdAndRemove(demandas[i]._id, function (err) {
                                                if (err) {
                                                    criarLogErro(err);
                                                } else {
                                                    console.log("Limpeza de demandas finalizadas concluída!");
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
        }
    });
};

var criarLogErro = function(mensagemErro){
    Erro.create({
        data: new Date(),
        log: mensagemErro
    });
};

module.exports = { limparReservasAuditorio, criarLogErro, moverChamados };
