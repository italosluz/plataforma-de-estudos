let cacheTemas = null;
let temaAtual = null;

export async function redacaoTemasBloco() {
    const secaoTemas = document.querySelector("#redacao-temas-conteudo");
    const templateCard = document.querySelector("#template-card-redacao");
    const dialogEl = document.querySelector("#dialog-redacao");

    if (!secaoTemas || !templateCard || !dialogEl) return;

    configurarEventos(secaoTemas, dialogEl);

    try {
        const temas = await buscarTemas();
        renderizarCards(temas, secaoTemas, templateCard);
    } catch (erro) {
        console.error("Erro ao buscar os temas de redação:", erro);
        secaoTemas.textContent = "Erro ao carregar os temas de redação.";
    }
}

async function buscarTemas() {
    if (cacheTemas) {
        return cacheTemas;
    }

    const resposta = await fetch("../../data/temas-redacao.json");

    if (!resposta.ok) {
        throw new Error(
            `Erro HTTP ${resposta.status} ao buscar os temas de redação`,
        );
    }

    cacheTemas = await resposta.json();
    return cacheTemas;
}

function renderizarCards(temas, secaoTemas, templateCard) {
    const fragmento = document.createDocumentFragment();

    temas.forEach((tema) => {
        const clone = templateCard.content.cloneNode(true);

        const img = clone.querySelector('[data-card="imagem"]');
        img.src = tema.ilustracao || "";
        img.alt = tema.proposta || "";

        clone.querySelector('[data-card="eixo"]').textContent = tema.eixo || "";
        clone.querySelector('[data-card="titulo"]').textContent =
            tema.proposta || "";
        clone.querySelector('[data-card="autor"]').textContent =
            tema.autor || "";
        clone.querySelector('[data-card="banca"]').textContent =
            tema.banca || "";
        clone.querySelector('[data-card="ano"]').textContent = tema.ano ?? "";

        clone.querySelector("[data-abrir-tema]").dataset.temaId = String(
            tema.id,
        );

        fragmento.appendChild(clone);
    });

    secaoTemas.replaceChildren(fragmento);
}

function abrirDialogTema(tema, dialogEl) {
    temaAtual = tema;

    dialogEl.querySelector('[data-dialog="eixo"]').textContent =
        tema.eixo || "";
    dialogEl.querySelector('[data-dialog="titulo"]').textContent =
        tema.proposta || "";

    const corpoEl = dialogEl.querySelector('[data-dialog="corpo"]');
    const motivadores = Array.isArray(tema.textos_motivadores)
        ? tema.textos_motivadores
        : [];

    const fragmento = document.createDocumentFragment();

    motivadores.forEach((item, indice) => {
        fragmento.appendChild(criarBlocoMotivador(item, indice));
    });

    corpoEl.replaceChildren(fragmento);
    corpoEl.scrollTop = 0;
    dialogEl.showModal();
}

function criarBlocoMotivador(item, indice) {
    const bloco = document.createElement("section");
    bloco.className = "motivador-bloco";

    const rotulo = document.createElement("span");
    rotulo.className = "motivador-rotulo";
    rotulo.textContent = `Texto ${paraRomano(indice + 1)}`;
    bloco.appendChild(rotulo);

    if (item.titulo?.trim()) {
        const titulo = document.createElement("h4");
        titulo.className = "motivador-titulo";
        titulo.textContent = item.titulo.trim();
        bloco.appendChild(titulo);
    }

    const conteudos = Array.isArray(item.conteudo) ? item.conteudo : [];

    if (item.tipo === "imagem") {
        conteudos.forEach((url) => {
            const figure = document.createElement("figure");
            figure.className = "motivador-figura";

            const img = document.createElement("img");
            img.className = "motivador-imagem";
            img.src = url;
            img.alt =
                item.titulo?.trim() ||
                `Imagem do Texto ${paraRomano(indice + 1)}`;
            img.loading = "lazy";

            figure.appendChild(img);
            bloco.appendChild(figure);
        });
    } else {
        conteudos.forEach((paragrafo) => {
            const p = document.createElement("p");
            p.className = "motivador-paragrafo";
            p.textContent = paragrafo;
            bloco.appendChild(p);
        });
    }

    const referencia = item.referencia?.trim();
    const fonte = item.fonte?.trim();

    if (referencia || fonte) {
        const rodape = document.createElement("footer");
        rodape.className = "motivador-rodape";

        if (referencia) {
            const refEl = document.createElement("p");
            refEl.className = "motivador-referencia";
            refEl.textContent = referencia;
            rodape.appendChild(refEl);
        }

        if (fonte && /^https?:\/\//i.test(fonte)) {
            const link = document.createElement("a");
            link.className = "motivador-fonte";
            link.href = fonte;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = referencia ? "Acessar fonte" : `Fonte: ${fonte}`;
            rodape.appendChild(link);
        }

        bloco.appendChild(rodape);
    }

    return bloco;
}

function configurarEventos(secaoTemas, dialogEl) {
    if (!secaoTemas.dataset.eventosProntos) {
        secaoTemas.addEventListener("click", (evento) => {
            const botao = evento.target.closest("[data-abrir-tema]");
            if (!botao || !cacheTemas) return;

            const id = Number(botao.dataset.temaId);
            const tema = cacheTemas.find((item) => item.id === id);

            if (tema) {
                abrirDialogTema(tema, dialogEl);
            }
        });

        secaoTemas.dataset.eventosProntos = "true";
    }

    if (!dialogEl.dataset.eventosProntos) {
        dialogEl.addEventListener("click", (evento) => {
            const clicouFora = evento.target === dialogEl;
            const clicouFechar = evento.target.closest("[data-fechar-dialog]");
            const clicouImprimir = evento.target.closest("[data-imprimir-tema]");

            if (clicouImprimir && temaAtual) {
                imprimirPropostaA4(temaAtual);
                return;
            }

            if (clicouFora || clicouFechar) {
                dialogEl.close();
            }
        });

        dialogEl.dataset.eventosProntos = "true";
    }
}

/* ===== Impressão personalizada em A4 (isolada via iframe) ===== */
async function imprimirPropostaA4(tema) {
    // Remove iframe anterior, caso exista
    document.querySelector("#iframe-impressao-proposta")?.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "iframe-impressao-proposta";
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(montarHtmlImpressaoA4(tema));
    doc.close();

    await aguardarImagens(doc);

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    iframe.contentWindow.addEventListener(
        "afterprint",
        () => iframe.remove(),
        { once: true },
    );
}

function montarHtmlImpressaoA4(tema) {
    const metadados = [
        tema.eixo ? `<strong>Eixo:</strong> ${escaparHtml(tema.eixo)}` : "",
        tema.banca ? `<strong>Banca:</strong> ${escaparHtml(tema.banca)}` : "",
        tema.ano ? `<strong>Ano:</strong> ${escaparHtml(String(tema.ano))}` : "",
        tema.autor ? `<strong>Autor:</strong> ${escaparHtml(tema.autor)}` : "",
    ].filter(Boolean);

    const motivadores = Array.isArray(tema.textos_motivadores)
        ? tema.textos_motivadores
        : [];

    const blocosHtml = motivadores
        .map((item, indice) => {
            const numero = paraRomano(indice + 1);
            const conteudos = Array.isArray(item.conteudo) ? item.conteudo : [];

            const tituloHtml = item.titulo?.trim()
                ? `<h3 class="texto-titulo">${escaparHtml(item.titulo.trim())}</h3>`
                : "";

            const corpoHtml =
                item.tipo === "imagem"
                    ? conteudos
                          .map(
                              (url) => `
                              <figure class="texto-figura">
                                  <img src="${escaparHtml(url)}" alt="${escaparHtml(item.titulo?.trim() || `Imagem do Texto ${numero}`)}" />
                              </figure>`,
                          )
                          .join("")
                    : conteudos
                          .map(
                              (paragrafo) =>
                                  `<p class="texto-paragrafo">${escaparHtml(paragrafo)}</p>`,
                          )
                          .join("");

            const ref = item.referencia?.trim();
            const fonte = item.fonte?.trim();
            const fonteValida = fonte && /^https?:\/\//i.test(fonte);

            const rodapeHtml =
                ref || fonteValida
                    ? `<footer class="texto-rodape">
                           ${ref ? `<p>${escaparHtml(ref)}</p>` : ""}
                           ${fonteValida ? `<p class="texto-url">Disponível em: ${escaparHtml(fonte)}</p>` : ""}
                       </footer>`
                    : "";

            return `
                <section class="texto-bloco">
                    <span class="texto-rotulo">TEXTO ${numero}</span>
                    ${tituloHtml}
                    ${corpoHtml}
                    ${rodapeHtml}
                </section>`;
        })
        .join("");

    return `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8" />
    <base href="${escaparHtml(document.baseURI)}" />
    <title>Proposta de Redação – ${escaparHtml(tema.proposta || "")}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 15mm 18mm 18mm 18mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.55;
            color: #111827;
            background: #ffffff;
        }

        .cabecalho {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #111827;
            margin-bottom: 14px;
        }

        .cabecalho-logo {
            height: 36px;
            width: auto;
            object-fit: contain;
        }

        .cabecalho-info {
            text-align: right;
            font-size: 9pt;
            color: #374151;
        }

        .cabecalho-info strong {
            display: block;
            font-size: 11pt;
            color: #111827;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }

        .metadados {
            display: flex;
            flex-wrap: wrap;
            gap: 6px 16px;
            font-size: 8.8pt;
            color: #374151;
            margin-bottom: 12px;
        }

        .caixa-proposta {
            border: 1.5px solid #111827;
            background-color: #f3f4f6;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 18px;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
        }

        .caixa-proposta-rotulo {
            display: block;
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #374151;
            margin-bottom: 4px;
        }

        .caixa-proposta h1 {
            margin: 0;
            font-size: 13pt;
            line-height: 1.35;
            color: #111827;
        }

        .instrucao {
            font-size: 9.5pt;
            color: #374151;
            text-align: justify;
            margin: 0 0 16px;
        }

        .texto-bloco {
            padding: 12px 0;
            border-top: 1px solid #d1d5db;
        }

        .texto-rotulo {
            display: inline-block;
            font-size: 9pt;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: #111827;
            margin-bottom: 6px;
            break-after: avoid;
        }

        .texto-titulo {
            margin: 0 0 8px;
            font-size: 11pt;
            color: #111827;
            break-after: avoid;
        }

        .texto-paragrafo {
            margin: 0 0 8px;
            text-align: justify;
            text-indent: 10mm;
            orphans: 3;
            widows: 3;
        }

        .texto-paragrafo:last-of-type {
            margin-bottom: 0;
        }

        .texto-figura {
            margin: 10px 0;
            text-align: center;
            break-inside: avoid;
        }

        .texto-figura img {
            max-width: 100%;
            max-height: 95mm;
            height: auto;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }

        .texto-rodape {
            margin-top: 8px;
            font-size: 8pt;
            line-height: 1.4;
            color: #4b5563;
            break-inside: avoid;
        }

        .texto-rodape p {
            margin: 2px 0;
        }

        .texto-url {
            word-break: break-all;
        }

        .rodape-pagina {
            margin-top: 22px;
            padding-top: 8px;
            border-top: 1px solid #9ca3af;
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #4b5563;
            break-inside: avoid;
        }
    </style>
</head>
<body>
    <header class="cabecalho">
        <img
            src="../assets/icons/logo-escopo-claro.png"
            alt="Logo Professor Ítalo Luz"
            class="cabecalho-logo"
        />
        <div class="cabecalho-info">
            <strong>Proposta de Redação</strong>
            <span>Professor Ítalo Luz – Plataforma de Estudos</span>
        </div>
    </header>

    ${metadados.length ? `<div class="metadados">${metadados.map((m) => `<span>${m}</span>`).join("")}</div>` : ""}

    <section class="caixa-proposta">
        <span class="caixa-proposta-rotulo">Tema da Redação</span>
        <h1>${escaparHtml(tema.proposta || "")}</h1>
    </section>

    <p class="instrucao">
        A partir da leitura dos textos motivadores e com base nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema proposto.
    </p>

    <main>
        ${blocosHtml}
    </main>

    <footer class="rodape-pagina">
        <span>www.app.italoluz.com.br</span>
        <span>instagram.com/italosiluz</span>
        <span>github.com/italosluz</span>
    </footer>
</body>
</html>`;
}

function aguardarImagens(doc) {
    const imagens = Array.from(doc.images);
    if (!imagens.length) return Promise.resolve();

    return Promise.all(
        imagens.map(
            (img) =>
                new Promise((resolve) => {
                    if (img.complete) {
                        resolve();
                    } else {
                        img.addEventListener("load", resolve, { once: true });
                        img.addEventListener("error", resolve, { once: true });
                    }
                }),
        ),
    );
}

function paraRomano(numero) {
    const mapa = [
        [10, "X"],
        [9, "IX"],
        [5, "V"],
        [4, "IV"],
        [1, "I"],
    ];
    let restante = numero;
    let resultado = "";

    for (const [valor, simbolo] of mapa) {
        while (restante >= valor) {
            resultado += simbolo;
            restante -= valor;
        }
    }
    return resultado || String(numero);
}

function escaparHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}