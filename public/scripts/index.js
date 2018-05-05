/////////////////////////////
//////// Variáveis Globais index.hbs
/////////////////////////////

var conteudos,
    intervaloSlides;

///////////////////////////
//////// SLIDESHOW
///////////////////////////


//slideshow - botões de navegação
document.querySelector(".slideshow").addEventListener("click", function(e){
    slideButton(e);
});
//função slideshow - buttons
function slideButton(e){
    var images = document.querySelectorAll(".slide");
    var activeIndex = 0;

    for (let i = 0; i < images.length; i++) {
        if(images[i].classList.contains("selected")) {
            activeIndex = i;
        }
    }

    //retirando classes esquerda e direita
    for (let i = 0; i < images.length; i++) {
        images[i].classList.remove("img-right");
        images[i].classList.remove("img-left");
    }

    if (e.target.classList.contains("fa-angle-right")) {
        reiniciarIntervalo();

        //manipulação da imagem que estava sendo exibida
        images[activeIndex].classList.remove("selected");
        images[activeIndex].classList.add("img-left");

        //manipulação da imagem à direita
        if (activeIndex === images.length-2) {
            images[0].classList.add("img-right");
        }

        if (activeIndex === images.length-1) {
            images[0].classList.add("selected");
        } else {
            images[activeIndex+1].classList.add("selected");
        }

        //manipulação da imagem à esquerda
        if (activeIndex === images.length-1) {
            images[1].classList.add("img-right");
        } else {
            if(images[activeIndex+2]) {
                images[activeIndex+2].classList.add("img-right");
            }
        }

        //novo índice ativo
        if (activeIndex === images.length-1) {
            activeIndex = 0;
        } else {
            activeIndex++;
        }

    } else if (e.target.classList.contains("fa-angle-left")) {
        reiniciarIntervalo();

        //manipulação da imagem que estava sendo exibida
        images[activeIndex].classList.remove("selected");
        images[activeIndex].classList.add("img-right");

        //manipulação da imagem à direita
        if (activeIndex === 1) {
            images[images.length - 1].classList.add("img-left");
        }

        if (activeIndex === 0) {
            images[images.length - 1].classList.add("selected");
        } else {
            images[activeIndex - 1].classList.add("selected");
        }

        //manipulação da imagem à esquerda
        if (activeIndex === 0) {
            images[0].classList.add("img-right");
            images[images.length-2].classList.add("img-left");
        } else {
            if (images[activeIndex-2]) {
                images[activeIndex-2].classList.add("img-left");
            }
        }

        //novo índice ativo
        if (activeIndex === 0) {
            activeIndex = images.length-1;
        } else {
            activeIndex--;
        }
    }
}

//function slideshow - auto
function slideshow(){
    var images = document.querySelectorAll(".slide");
    var activeIndex = 0;

    for (let i = 0; i < images.length; i++) {
        if(images[i].classList.contains("selected")) {
            activeIndex = i;
        }
    }

    //retirando classes esquerda e direita
    for (let i = 0; i < images.length; i++) {
        images[i].classList.remove("img-right");
        images[i].classList.remove("img-left");
    }

    //manipulação da imagem à esquerda
    if (activeIndex === images.length-1) {
        images[1].classList.add("img-right");
    } else {
        if(images[activeIndex+2]) {
            images[activeIndex+2].classList.add("img-right");
        }
    }

    //manipulação da imagem que estava sendo exibida
    images[activeIndex].classList.remove("selected");
    images[activeIndex].classList.add("img-left");

    //manipulação da imagem à direita
    if (activeIndex === images.length-2) {
        images[0].classList.add("img-right");
    }

    if (activeIndex === images.length-1) {
        images[0].classList.add("selected");
    } else {
        images[activeIndex+1].classList.add("selected");
    }

    //novo índice ativo
    if (activeIndex === images.length-1) {
        activeIndex = 0;
    } else {
        activeIndex++;
    }
}

//inicia a passagem automática do slideshow.
intervaloSlides = setInterval(slideshow, 5500);

//função para reiniciar um intervalo qualquer.
function reiniciarIntervalo(){
    clearInterval(intervaloSlides);
    intervaloSlides = setInterval(slideshow, 5500);
}


///////////////////////////
//////// ACESSO RÁPIDO
///////////////////////////

// botão de exibição da janela
document.getElementById("acesso-rapido-controle").addEventListener("click", function(e){
    var offsetUp,
        offsetDown;
    e.target.classList.toggle("fa-caret-down");
    e.target.classList.toggle("fa-caret-up");
    document.querySelector(".acesso-rapido").classList.toggle("aberto");
    if ($(window).width() < 500) {
        offsetUp = 70;
        offsetDown = 10;
    } else if ($(window).width() >= 500 && $(window).width() < 1024) {
        offsetUp = 90;
        offsetDown = 20;
    }
    if (e.target.classList.contains("fa-caret-down") && $(window).width() < 1024) {
        $('html, body').animate({ scrollTop: $('.acesso-rapido').offset().top - offsetDown}, 'slow', function () {
            //callback para usar se eu quiser executar algo ao final do scroll
        });
    } else if ($(window).width() < 1024) {
        $('html, body').animate({ scrollTop: $('.acesso-rapido').offset().top - offsetUp}, 'slow', function () {
            //callback para usar se eu quiser executar algo ao final do scroll
        });
    }
});

/////////////////
//////// SEÇÔES DA PÁGINA PRINCIPAL
/////////////////

document.getElementById("secoes").addEventListener("click", function(e){
    if (!variaveisGlobais.desktopDef) {
        var scroll;
        //fechando todos os menus
        if (e.target.classList.contains("div-angle") || e.target.classList.contains("div-icon")) {
            for (let i = 0; i < document.querySelectorAll(".index-secao").length; i++) {
                if (e.target.parentElement !== document.querySelectorAll(".index-secao")[i]) {
                    document.querySelectorAll(".index-secao")[i].classList.remove("aberto");
                    document.querySelectorAll(".index-secao")[i].firstElementChild.firstElementChild.classList.remove("fa-angle-up");
                    document.querySelectorAll(".index-secao")[i].firstElementChild.firstElementChild.classList.add("fa-angle-down");
                }
            }
        }
        //comportamento ao clicar no cabeçalho da seção
        if (e.target.classList.contains("div-icon")) {
            e.target.parentElement.classList.toggle("aberto");
            e.target.previousElementSibling.firstElementChild.classList.toggle("fa-angle-down");
            e.target.previousElementSibling.firstElementChild.classList.toggle("fa-angle-up");
            //scroll suave para o início da seção
            scroll = setTimeout(function(){
                $('html, body').animate({ scrollTop: $('#' + e.target.parentElement.id).offset().top - 70}, 'slow', function () {
                    //callback para usar se eu quiser executar algo ao final do scroll
                });
            }, 310);
        }

        //comportamento ao clicar no ícone-seta
        if (e.target.classList.contains("fa-angle")) {
            e.target.parentElement.parentElement.classList.toggle("aberto");
            e.target.classList.toggle("fa-angle-down");
            e.target.classList.toggle("fa-angle-up");
            //scroll suave para o início da seção
            scroll = setTimeout(function(){
                if (e.target.classList.contains("fa-angle-up")) {
                    $('html, body').animate({ scrollTop: $('#' + e.target.parentElement.parentElement.id).offset().top - 70}, 'slow', function () {
                    //callback para usar se eu quiser executar algo ao final do scroll
                    });
                } else if (e.target.classList.contains("fa-angle-down") && e.target.parentElement.parentElement.nextElementSibling) {
                    $('html, body').animate({ scrollTop: $('#' + e.target.parentElement.parentElement.nextElementSibling.id).offset().top - 70}, 'slow', function () {
                    //callback para usar se eu quiser executar algo ao final do scroll
                    });
                } else if (e.target.classList.contains("fa-angle-down") && !e.target.parentElement.parentElement.nextElementSibling) {
                    $('html, body').animate({ scrollTop: $('#' + document.querySelectorAll(".index-secao")[0].id).offset().top - 70}, 'slow', function () {
                    //callback para usar se eu quiser executar algo ao final do scroll
                    });
                }
            }, 310);
        }
    }
});


//exibição apenas do slideshow no topo
document.querySelector(".top-bar").classList.add("topbar-pagina-principal");

//body com bckgclr diferenciado
document.querySelector("body").classList.add("body-pagina-principal");

////////////////////////////////////////////////////////
//////////////EXIBINDO CONTEÚDOS VIA AJAX //////////////
////////////////////////////////////////////////////////

//requisição de conteúdos via AJAX
var recuperarConteudos = async function() {
    await $.ajax({type: 'GET',
        url: "/recuperarIndex",
        //data: {"natureza": natureza},
        dataType: "json"
    }).done( function( msg ) {
        if (msg) {
            conteudos = msg;
        }
    }).fail(function(msg){
        console.log("Fail! " +msg.data);
    });
    variaveisGlobais.removePreLoaders(".conteudo-index");
    return conteudos;
};

//recuperando slides
var slidesDOM = function(slides) {
    var slidesContainer = document.querySelector(".slides-container");

    for (let i = 0; i < slides.length; i++) {
        let content = "";
        let slideImg;
        if (!variaveisGlobais.mobileDef) {
            slideImg = slides[i].arquivo;
        } else {
            slideImg = `${slides[i].arquivo}Sm`;
        }
        if (slides[i].selecionado) {
            content += `<div class="slide selected" style="background: #fff url('./img/slides/${slideImg}.jpg') no-repeat left; background-size: cover">`;
        } else if (slides[i].right) {
            content += `<div class="slide img-right" style="background: #fff url('./img/slides/${slideImg}.jpg') no-repeat left; background-size: cover">`;
        } else {
            content += `<div class="slide" style="background: #fff url('./img/slides/${slideImg}.jpg') no-repeat left; background-size: cover">`;
        }
        content += `<div class="slide-header">
                        <h3>${slides[i].titulo}</h3>
                        <p>${slides[i].resumo}</p>
                    </div>
                    <i class="fa fa-angle-left"></i>
                    <i class="fa fa-angle-right"></i>
                </div>`;
        slidesContainer.insertAdjacentHTML("beforeend", content);
    }
};
//recuperando destaques
var destaquesDOM = function(destaques){
    for (let i = 0; i < destaques.length; i++){
        var img;
        if (i === 0) {
            img = "Md";
        } else {
            img = "Sq";
        }

        var content = `<article class="destaque"><a href="/conteudos/${destaques[i]._id}">`;

        if (destaques[i].imagem) {
            content += `<picture class="img-news-container" alt="${destaques[i].titulo}">
                            <source media="(min-width: 1024px)" srcset="/img/conteudos/${destaques[i]._id}${img}.jpg">
                            <source media="(min-width: 300px)" srcset="/img/conteudos/${destaques[i]._id}Sm.jpg">
                            <img src="img/conteudos/${destaques[i]._id}Md.jpg">
                        </picture>`;
        }
        content += `<div class="content borda-${destaques[i].natureza}">
                        <div>
                            <h3>${destaques[i].titulo}</h3>
                            <span class='span-conteudo borda-${destaques[i].natureza}'>${destaques[i].natureza}</span>
                        </div>
                        <p>${destaques[i].texto.substring(0, 160).replace(/(<([^>]+)>)/ig," ")}...</p>
                        <div class="leia-mais-div"><span class="leia-mais">Leia mais</span> </div>
                    </div>
                </a></article>`;
        document.querySelector(".secao-destaques").insertAdjacentHTML("beforeend", content);
    }
    document.querySelector(".secao-destaques").insertAdjacentHTML("beforeend",`<div class="arquivo"></div><div class="arquivo"></div><div class="arquivo"></div>`);
};

//recuperando notícias recentes
var recentesDOM = function(recentes) {
    for (let i = 0; i < recentes.length; i++) {
        var content = "";
        content += `<article class="noticia">`;
        if (recentes[i].imagem) {
            content += ` <div class="img-news-container" alt="${recentes[i].titulo}"> <img src="img/conteudos/${recentes[i]._id}Sm.jpg"></div>`
        }
        content += `<div class="content borda-${recentes[i].natureza}">
                       <span class="data">${recentes[i].dataAmigavel}</span>
                        <a href="/conteudos/${recentes[i]._id}"><h3>${recentes[i].titulo}</h3></a>

                        <span class='span-conteudo borda-${recentes[i].natureza}'>${recentes[i].natureza}</span>

                        <p>${recentes[i].texto.substring(0, 160).replace(/(<([^>]+)>)/ig," ")}...</p>
                        <div class="leia-mais-div"><a href="/conteudos/${recentes[i]._id}"><span class="leia-mais">Leia mais</span></a> </div>
                    </div>
                </article>`;
        document.querySelector(".secao-conteudos-recentes").insertAdjacentHTML("beforeend", content);
    }
};

//recuperando midias: midias é o vetor contendo os conteúdos. tipo deve ser "videos" ou "fotos".
var midiasDOM = function(midias, tipo){
    let arquivo, subtipo, tamanhoThumb;
    window.innerWidth <= 500 ? tamanhoThumb = "m" : tamanhoThumb = "l"
    
    for (let i = 0; i < midias.length; i++) {
        if (midias[i].natureza === tipo) {
            if (tipo === "video") {
                subtipo = `<span class='subtipo'>${midias[i].subtipo}</span>`;
                arquivo = `<div class="youtube-player video-${midias[i].midia} borda-${midias[i].natureza}" data-id='${midias[i].midia}'></div>`;                
            } else {
                arquivo = `<a href='https://www.instagram.com/p/${midias[i].midia}/?taken-by=ccs_ufrj' target='_blank'><div class='foto-container borda-${midias[i].natureza}'><img src="https://www.instagram.com/p/${midias[i].midia}/media/?size=${tamanhoThumb}" alt='${midias[i].titulo}'></div></a>`;
                subtipo = "";
            }            
            document.querySelector(`.cards-${tipo}s`).insertAdjacentHTML("beforeend",
                `<div class="arquivo">
                    ${arquivo}
                    ${subtipo}
                    <h3>${midias[i].titulo}</h3>
                    <div class='descricao descricao-${midias[i].midia} hidden opacidade-zero'>
                        
                        <p class = midia-titulo>${midias[i].titulo}</p>
                        <div class='midia-texto'>${midias[i].texto}</div>
                    </div>
                </div>`
            );
        }
    }
    document.querySelector(`.cards-${tipo}s`).insertAdjacentHTML("beforeend",
       `<div class="arquivo placeholder"></div><div class="arquivo placeholder"></div><div class="arquivo placeholder"></div>`
    );
};

document.addEventListener("DOMContentLoaded", async function(){

    //eliminando a agenda suspensa
    document.querySelector(".agenda-wrapper").outerHTML = "";

    //recuperando conteúdos
    await recuperarConteudos();

    var noticiasRecentes = conteudos[0],
    midias = conteudos[1],
    slides = conteudos[2],
    destaques = conteudos[3];

    //exibindo slides
    slidesDOM(slides);

    //exibindo os destaques
    destaquesDOM(destaques);

    //exibindo as notícias recentes
    recentesDOM(noticiasRecentes);

    //renderizando as seções vídeos e imagens
    midiasDOM(midias, "video");
    midiasDOM(midias, "foto");
    
    //rotinas para criação do frame (youtube API)
    var tag = document.createElement('script');    
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    var player;

    var rotinasYoutube = (id) => {         
        function onYouTubeIframeAPIReady(id) {                
            player = new YT.Player(`ytPlayer-${id}`, {                
                videoId: id,
                events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
                }
            });            
        }

        function onPlayerReady(event) {
            event.target.playVideo();            
        }   
        
        function onPlayerStateChange(event) {                 
            // qualquer coisa a fazer quando houver mudança de estado do vídeo
        }
        function stopVideo() {            
            player.stopVideo();                 
        } 
        onYouTubeIframeAPIReady(id);
    }
    
    //exibindo um vídeo em detalhes
    document.querySelector(`.videos-body .card-container`).addEventListener("click", (e) => {   
        if (e.target.tagName === "IMG" && !document.getElementById('overlay').classList.contains("video-ativo")) {
            let id = $(e.target.parentElement).attr("data-id");
            let arquivo = document.querySelector(`.video-${id}`).parentElement;
            variaveisGlobais.controlarVisibilidade("exibir", "#overlay", 600);
            document.getElementById('overlay').classList.add("video-ativo");  
            document.getElementById('overlay').innerHTML = "";
            document.getElementById('overlay').insertAdjacentHTML("beforeend", `<div id='ytPlayer-${id}' class='youtube-player full-size'></div><i class="fa fa-times fechar-midia"></i>`);            
            variaveisGlobais.controlarVisibilidade("exibir", `.descricao-${id}`);  
            document.querySelector(`.body-pagina-principal`).classList.add("fixo");
            rotinasYoutube(id);
            fecharPlayer(id)
        }                 
    });

    //função para fechar a janela do player
    var fecharPlayer = (id) => {
        document.querySelector(".fechar-midia").addEventListener("click", () => {
            player.stopVideo();  
            //ocultar overlay e revover classe no time 
            variaveisGlobais.controlarVisibilidade("ocultar", "#overlay", 600);
            setTimeout(() => {
                document.getElementById('overlay').classList.remove("video-ativo");                
            }, 600);         
            document.getElementById(`ytPlayer-${id}`).classList.remove("full-size");
            variaveisGlobais.controlarVisibilidade("ocultar", `.descricao-${id}`, 600);
            document.querySelector(`.body-pagina-principal`).classList.remove("fixo");
        });
    };
    // criando os thumbs de vídeos
    var div, n,
        v = document.getElementsByClassName("youtube-player");
    for (n = 0; n < v.length; n++) {        
        div = document.createElement("div");
        div.setAttribute("data-id", v[n].dataset.id);
        div.innerHTML = variaveisGlobais.labnolThumb(v[n].dataset.id);        
        //div.onclick = variaveisGlobais.labnolIframe;        
        v[n].appendChild(div);
    }    
});