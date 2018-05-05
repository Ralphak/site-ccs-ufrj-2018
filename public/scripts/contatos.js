
//busca de contatos via AJAX
var contatosConsulta = async function(termos, reservarAuditorios, analisarReservaAuditorios, gerenteSistema, chefeManutencao) {
    await $.ajax({type: 'GET',
        url: "/recuperarContatos",
        data: {termos, reservarAuditorios, analisarReservaAuditorios, gerenteSistema, chefeManutencao},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            variaveisGlobais.contatos = msg;
        }
    }).fail(function(msg){
        console.log("Fail! " + msg.data);
    });
    variaveisGlobais.removePreLoaders(".contatos");
    return variaveisGlobais.contatos;
};

//busca de contatos via AJAX
var contatosEditar = async function() {
    var idContato = document.getElementsByTagName("form")[2].id;
    await $.ajax({type: 'GET',
        url: "/recuperarContatoPorId",
        data: {id: idContato},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            variaveisGlobais.contatos = msg;
        }
    }).fail(function(msg){
        console.log("Fail! " + msg.data);
    });
    variaveisGlobais.removePreLoaders(".contatos");
    return variaveisGlobais.contatos;
};

//Exibindo o resultado da busca de contatos em tela
var exibirContatos = function(contatos) {
    document.getElementById("resultados").innerHTML = "";
    document.getElementById("resultados").insertAdjacentHTML("beforeend", `<span>Foram encontrados ${contatos.length} contatos</span>`);
    for (let i = 0; i < contatos.length; i++) {

        var contato = `
            <div class="contato" id="${contatos[i]._id}">
                <h3>${contatos[i].nome}</h3>
                <div class="edicao">
                    <a href="/contatos/editar/${contatos[i]._id}"><button>editar</button></a><form action="/contatos/excluir/${contatos[i]._id}" method="post" id="excluir-contato" class="formulario" accept-charset="utf-8">
                    <input type="text" class="hidden" name="id" value="${contatos[i]._id}">
                    <input type="submit" value="excluir contato"></form>
                </div>
                <div class="dados">
                    <div><strong>E-mail:</strong><p>${contatos[i].email}</p></div>
                    <div><strong>Telefone:</strong><p>${contatos[i].telefone}</p></div>
                    <div><strong>Vínculo:</strong><p>${contatos[i].vinculo}</p></div>
                    <div><strong>Cargo:</strong><p>${contatos[i].cargo}</p></div>
                    <div><strong>Grupos:</strong><p>${contatos[i].grupos}</p></div>
                `;


        if (contatos[i].permissoes) {
            contato += "<div><strong>Permissões:</strong> <ul>";
            if (contatos[i].permissoes.reservarAuditorios) {
                contato += "<li>Solicitar reserva</li>";
            }
            if (contatos[i].permissoes.analisarReservaAuditorios) {
                contato += "<li>Analisar pedidos de reserva</li>";
            }
            if (contatos[i].permissoes.gerenteSistema) {
                contato += "<li>Gerência do Sistema</li>";
            }
            if (contatos[i].permissoes.chefeManutencao) {
                contato += "<li>Chamados de Manutenção</li>";
            }
            if (!contatos[i].permissoes.reservarAuditorios && !contatos[i].permissoes.analisarReservaAuditorios && !contatos[i].permissoes.gerenteSistema && !contatos[i].permissoes.chefeManutencao) {
                contato += "<li>nenhum</li>";
            }
            contato +=`</ul></div>`
        }
        contato+= `</div></div>`;

        document.getElementById("resultados").insertAdjacentHTML("beforeend", contato);
    }
};

var inserirCargos = function() {
    let total = document.querySelectorAll(".input-cargo-div").length,
    cargos;
    cargos = `
    <div class="input-cargos-div">
        <div class="input-cargos">
            <label for="contexto">contexto</label>
            <input type="text" name="contexto" id="contexto${total}">
        </div>
        <div class="input-cargos">
            <label for="cargo${total}">cargo</label>
            <input type="text" name="cargo" id="cargo${total}">
        </div>        
        <i class="fa fa-times-circle"></i>
    </div>`;
    document.querySelector(".cargos").insertAdjacentHTML("afterbegin", cargos);
    //document.getElementById(`nomeMaterial${total}`).focus();
};

var recuperarCargos = function (cargos) {    
    document.querySelector(".cargos").innerHTML = "";
    //buscar cargos já existentes    
    let DOMCargos = "";
    for(let i = 0; i < cargos.length; i++) {
        DOMCargos += `
        <div class="input-cargos-div">
            <div class="input-cargos">
                <label for="contexto${i}">contexto</label>
                <input type="text" name="contexto" id="contexto${i}" value="${cargos[i].contexto}">
            </div>
            <div class="inputcargosl">
                <label for="cargo${i}">cargo</label>
                <input type="text" name="cargo" id="cargo${i}" value="${cargos[i].cargo}">
            </div>        
            <i class="fa fa-times-circle"></i>
        </div>`;
    }
    document.querySelector(".cargos").insertAdjacentHTML("beforeend", DOMCargos);
};

/////////////////////////////
///////// LISTENERS /////////
/////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {
    //página de busca de contatos
    if (document.getElementById("localizar-contato")) {
        document.getElementById("btn-submit").addEventListener("click", async function(e) {
            e.preventDefault();
            var termoBusca, reservar, analisar, gerente, manutencao, termos, reservarAuditorios, analisarReservaAuditorios, gerenteSistema, chefeManutencao;       
    
            termos = document.getElementById("query").value;
            reservarAuditorios = document.getElementById("reservarAuditorios");
            analisarReservaAuditorios = document.getElementById("analisarReservaAuditorios");
            gerenteSistema = document.getElementById("gerenteSistema");
            chefeManutencao = document.getElementById("chefeManutencao");
    
            if (termos) {
                termoBusca = {$text:{$search:termos}};
            }
            if (reservarAuditorios.checked) {
                reservar = {"permissoes.reservarAuditorios":true};
            }
            if (analisarReservaAuditorios.checked) {
                analisar = {"permissoes.analisarReservaAuditorios": true};
            }
            if (gerenteSistema.checked) {
                gerente = {"permissoes.gerenteSistema": true};
            }
            if (chefeManutencao.checked) {
                manutencao = {"permissoes.chefeManutencao": true};
            }
            await contatosConsulta(termoBusca, reservar, analisar, gerente, manutencao);
            exibirContatos(variaveisGlobais.contatos);
        });
    }
    
    //carregando a página de edição de contato:
    if (document.querySelector(".editar-contato")) {
        
        var contato = await contatosEditar();
        
        document.getElementById("nome").value = contato.nome;
        document.getElementById("email").value = contato.email;
        if (contato.foto) {
            document.getElementById("foto-sim").checked = true;
        } else {
            document.getElementById("foto-nao").checked = true;
        }
        document.getElementById("tel").value = contato.telefone;
        document.getElementById("vinculo").value = contato.vinculo;
                    
        recuperarCargos(contato.cargos)
        
        
        var grupos = "";
        for (let i = 0; i < contato.grupos.length; i++) {
            if (i < contato.grupos.length - 1) {
                grupos += `${contato.grupos[i]},`
            } else {
                grupos += contato.grupos[i];
            }
        }
        document.getElementById("grupos").value = grupos;
        if (contato.permissoes) {
            if (contato.permissoes.reservarAuditorios) {
                document.getElementById("reservarAuditorios").checked = true;
            }
            if (contato.permissoes.analisarReservaAuditorios) {
                document.getElementById("analisarReservaAuditorios").checked = true;
            }
            if (contato.permissoes.gerenteSistema) {
                document.getElementById("gerenteSistema").checked = true;
            }
            if (contato.permissoes.chefeManutencao) {
                document.getElementById("chefeManutencao").checked = true;
            }   
        }
    }
    if (document.querySelector('.editar-contato') || document.querySelector('.inserir-contato') ) {
        //adicionando novos cargos
        document.querySelector('.inserir-cargo').addEventListener("click", inserirCargos);

        //eliminando cargos
        document.querySelector(".cargos").addEventListener('click', function (e) {
            if(e.target.classList.contains("fa-times-circle")){
                e.target.parentElement.remove();
            }            
        });
    }
});
