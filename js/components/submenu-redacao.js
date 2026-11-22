import { folhaRedacao } from "./folha-modelo-redacao.js";

const conteudoPrincipal = document.querySelector("#conteudo-principal");
const secaoNome = document.querySelector("#submenu-redacao-titulo");
const secaoBotoes = document.querySelector("#submenu-redacao-botoes");

const secoesRedacao = {
    "temas": { titulo: "Temas de Redação" },
    "folha-modelo": { titulo: "Gerar Folha Modelo de Redação", aoCarregar: folhaRedacao},
    "registros": { titulo: "Meus Registros de Redação" },
    "aulas": { titulo: "Aulas de Redação" },
};

function renderizarSecao(idSecao) {
    const config = secoesRedacao[idSecao];
    const template = document.querySelector(`#redacao-${idSecao}`);
    
    if (!config || !template) return;

    const clone = template.content.cloneNode(true);
    
    secaoNome.textContent = config.titulo;
    conteudoPrincipal.replaceChildren(clone);
    
    if (config.aoCarregar) {
        config.aoCarregar();
    }

    secaoBotoes.querySelectorAll("button").forEach(btn => {
        const estaAtivo = btn.dataset.secao === idSecao;
        btn.classList.toggle("submenu-redacao-ativo", estaAtivo)
    })
}

secaoBotoes.addEventListener("click", event => {
    const botao = event.target.closest("button[data-secao]");
    if (!botao) return;
    renderizarSecao(botao.dataset.secao);
})

renderizarSecao("folha-modelo");

