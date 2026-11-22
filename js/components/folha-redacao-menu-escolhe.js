import { folhaRedacao } from "./folha-redacao.js";

const conteudoPrincipal = document.querySelector("#conteudo-principal");
const secaoNome = document.querySelector("#menu-escolhe-titulo");
const secaoBotoes = document.querySelector("#menu-escolhe-buttons");

const secoesRedacao = {
    "temas": { titulo: "Temas de Redação" },
    "folha-modelo": { titulo: "Gerar Folha Modelo de Redação", aoCarregar: folhaRedacao},
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
        btn.classList.toggle("menu-escolhe-ativo", estaAtivo)
    })
}

secaoBotoes.addEventListener("click", event => {
    const botao = event.target.closest("button[data-secao]");
    if (!botao) return;
    renderizarSecao(botao.dataset.secao);
})

renderizarSecao("folha-modelo");

