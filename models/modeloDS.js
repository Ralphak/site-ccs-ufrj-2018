const mongoose = require("../mongoose");

/*
Chamados de manutenção:
propriedades preenchidas pelo solicitante:
    Identificação: descrição sucinta insertida pelo gerente do sistema para fácil identificação de uma demanda específica
    Solicitante: nome completo do solilcitante
    Matrícula: SIAPE ou DRE
    função: cargo, ou função que ocupa
    Unidade: Unidade acadêmica da ufrj
    categoria: técnico, docente ou estudante
    local: localização completa: prédio, andar, sala, complemento
    horário: dias e horários nos quais é possível receber a equipe da manutenção
    telefone e e-mail: contatos principais
    obs: observações gerais
Proripedades preenchidas pela Decania
    estado:
        aberta - demanda enviada por usuário, porém sem atribuição de responsável
        em andamento - criadas as OS, aguardando suas execuções
        atendida parcialmente - alguma OS não pode ser executada/ainda não foi concluída
        atendida - todas as OSs executadas
        não atendida - nenhuma OS pôde ser executada.
    prioridade: normal ou alta (0 ou 1);
Propriedades preenchidas automaticamente:
OS: populado automaticamente, quando criada uma nova OS vinculada à DS em questão


*/
var eventoSchema = new mongoose.Schema({
    data: Date,
    texto: String
}, {_id:false}); 

var dsSchema = new mongoose.Schema({
    identificacao: String,
    solicitante: String,
    matricula: String,
    categoria: String,
    unidade:String,
    cargo: String,
    localTrabalho: String,
    local: String,
    telefone: String,
    email: String,
    horarios: String,
    descricao: String,
    obs: String,
    estado: String,
    prioridade: Boolean,
    dataFinalizacao: Date,
    fotos: [],
    eventos: [eventoSchema],
    os: [
        {
            type: String,
            ref: "Os"
        }
    ]
});

dsSchema.index({solicitante: 'text', categoria: 'text', unidade: 'text', estado: 'text'});

var Ds = mongoose.model("Ds", dsSchema);

module.exports = Ds;
