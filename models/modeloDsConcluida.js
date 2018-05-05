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
        aberto - chamado criado pelo usuário e ainda não tratado pela adm
        em andamento - criadas as OS, aguardando suas execuções
        atendido parcialmente - alguma OS não pode ser executada/ainda não foi concluída
        atendido - todas as OSs executadas
        nao atendido - nenhuma OS pôde ser executada.
    prioridade: normal ou alta (0 ou 1);
Propriedades preenchidas automaticamente:
OS: populado automaticamente, quando criada uma nova OS vinculada à DS em questão
*/
//scheme and model for reservas

var eventoSchema = new mongoose.Schema({
    data: Date,
    texto: String
}, {_id:false});

var dsConcluidaSchema = new mongoose.Schema({
    identificacao: String,
    solicitante: String,
    matricula: String,
    categoria: String,
    unidade:String,
    cargo: String,
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
            ref: "OsConcluida"
        }
    ]
});

dsConcluidaSchema.index({solicitante: 'text', categoria: 'text', unidade: 'text', estado: 'text'});

var DsConcluida = mongoose.model("DsConcluida", dsConcluidaSchema);

module.exports = DsConcluida;
