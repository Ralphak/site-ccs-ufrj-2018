var selected,
    selectedOld;

document.getElementById("naturezaContato").addEventListener("change", function(e){
    if (document.querySelector(".top-bar-desktop").classList.contains("fixed")) {
        $('html, body').animate({ scrollTop: $('.formularios').offset().top - 50}, 'slow', function () {

        });
    } else {
        $('html, body').animate({ scrollTop: $('.formularios').offset().top -93}, 'slow', function () {

        });
    }

    if (selectedOld) {
        variaveisGlobais.controlarVisibilidade("ocultar", `#${selectedOld}`, 300);
    }
    selectedOld = e.target.value;
    variaveisGlobais.controlarVisibilidade("exibir", `#${e.target.value}`);
    document.querySelector(".formularios-vazio").classList.add("hidden");});

//selecionando arquivos diversos e ocultando o tipo de arquivo no formulário de envio de conteúdos
document.querySelector(`.btn-inserir-arquivos`).addEventListener('click', (e) => {
    setTimeout(() => {
        document.querySelectorAll(`select[name='tipoArquivo'] option[value='diversos']`)[0].selected = true;
        document.querySelectorAll(`.tipo-arquivo`)[0].classList.add('hidden');        
    }, 2);
});

document.getElementById(`btn-submit`).addEventListener('click', (e) => {
    e.preventDefault();
    let inputs = document.querySelectorAll("#enviar-conteudo input[required], #enviar-conteudo select[required], #enviar-conteudo textarea[required]");
    let problema = variaveisGlobais.checarInputs(inputs);
    if (!problema) {
        document.getElementById(`enviar-conteudo`).submit();
    }
});

document.getElementById(`btn-submit-reportar-problema`).addEventListener('click', (e) => {
    e.preventDefault();
    let inputs = document.querySelectorAll("#reportar-problema input[required], #reportar-problema select[required], #reportar-problema textarea[required]");
    let problema = variaveisGlobais.checarInputs(inputs);
    if (!problema) {
        document.getElementById(`reportar-problema`).submit();
    }

});