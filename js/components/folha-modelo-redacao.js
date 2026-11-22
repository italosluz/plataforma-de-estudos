export function folhaRedacao() {
    // Campo numérico onde o usuário digita a quantidade de linhas
    const inputLinhas = document.getElementById("qtdLinhas");

    // Container onde todas as folhas geradas serão inseridas
    const areaImpressao = document.getElementById("area-impressao");

    // Lista (NodeList) com todos os botões predefinidos que possuem o atributo data-linhas
    const botoesPreset = document.querySelectorAll(
        ".controles button[data-linhas]",
    );

    // Faz uma cópia profunda (true = copia também todos os filhos) da .folha original
    // para guardá-la em memória e reutilizar como molde sempre que novas páginas forem criadas
    const moldeFolha = areaImpressao.querySelector(".folha").cloneNode(true);

    function atualizarBotaoAtivo(qtd) {
        // Percorre cada botão (ENEM, Fuvest, Unicamp...)
        botoesPreset.forEach((btn) => {
            // Lê o valor de data-linhas (que vem como texto), converte para número
            // e adiciona a classe "ativo" se for igual a qtd (ou remove se for diferente)
            btn.classList.toggle("ativo", Number(btn.dataset.linhas) === qtd);
            console.log(Number(btn.dataset.linhas), qtd);
        });
    }

    function criarPagina(linhaInicio, linhaFim) {
        // Clona o molde salvo para criar uma nova folha independente (com logo, cabeçalho e rodapé)
        const folha = moldeFolha.cloneNode(true);

        // Encontra o container das linhas dentro desta folha específica e garante que esteja vazio
        const grade = folha.querySelector(".grade");
        grade.innerHTML = "";

        // Gera as linhas numeradas do número inicial até o final desta página
        for (let i = linhaInicio; i <= linhaFim; i++) {
            // Cria a linha: <div class="linha"></div>
            const div = document.createElement("div");
            div.className = "linha";

            // Cria o número da linha: <div class="numero">1</div>
            const num = document.createElement("div");
            num.className = "numero";
            num.textContent = i;

            // Cria o traço onde o aluno escreve: <div class="traco"></div>
            const traco = document.createElement("div");
            traco.className = "traco";

            // Monta a estrutura: coloca número e traço dentro da linha, e a linha dentro da grade
            div.appendChild(num);
            div.appendChild(traco);
            grade.appendChild(div);
        }

        // Devolve a folha pronta para ser inserida na página
        return folha;
    }

    function gerarLinhas(qtd) {
        // Remove todas as folhas anteriores da tela antes de gerar as novas
        areaImpressao.innerHTML = "";

        // Define o limite de linhas por folha e calcula quantas folhas serão necessárias
        // Math.ceil arredonda para cima (ex.: 33 / 30 = 1.1 -> 2 folhas)
        const linhasPorPagina = 30;
        const totalPaginas = Math.ceil(qtd / linhasPorPagina);

        // Cria um container invisível na memória para montar tudo fora da tela (melhor desempenho)
        const fragmento = document.createDocumentFragment();

        // Repete uma vez para cada página necessária (p começa em 0)
        for (let p = 0; p < totalPaginas; p++) {
            // Calcula em qual número esta página começa (p=0 -> 1; p=1 -> 31)
            const inicio = p * linhasPorPagina + 1;

            // Calcula em qual número esta página termina sem ultrapassar o total pedido (qtd)
            // Ex.: para qtd=45 -> p=0 termina em 30; p=1 termina em 45 (em vez de 60)
            const fim = Math.min((p + 1) * linhasPorPagina, qtd);

            // Cria a folha correspondente a esse intervalo e adiciona ao fragmento
            fragmento.appendChild(criarPagina(inicio, fim));
        }

        // Insere todas as folhas de uma única vez no HTML real
        areaImpressao.appendChild(fragmento);

        // Atualiza qual botão predefinido deve aparecer destacado
        atualizarBotaoAtivo(qtd);
    }

    botoesPreset.forEach((botao) => {
        botao.addEventListener("click", (event) => {
            console.log("Oi")
            const quantidade = Number(event.target.dataset.linhas);
            inputLinhas.value = quantidade;
            gerarLinhas(quantidade);
        });
    });

    // Dispara em tempo real a cada caractere digitado ou clicado nas setinhas do input
    inputLinhas.addEventListener("input", () => {
        // Converte o texto do input para número inteiro na base decimal (10)
        const valor = parseInt(inputLinhas.value, 10);

        // Se o usuário apagou tudo (NaN = Not a Number), não faz nada ainda para deixá-lo digitar
        if (isNaN(valor)) return;

        // Garante que o número fique sempre travado entre 1 e 60
        const qtd = Math.min(Math.max(valor, 1), 60);
        gerarLinhas(qtd);
    });

    // Dispara quando o usuário clica fora do input (perde o foco)
    inputLinhas.addEventListener("blur", () => {
        // Se o campo ficou vazio ou inválido, assume 1 como padrão
        const valor = parseInt(inputLinhas.value, 10) || 1;

        // Trava novamente entre 1 e 60
        const qtd = Math.min(Math.max(valor, 1), 60);

        // Corrige visualmente o valor dentro do input (ex.: se digitou 999, vira 60)
        inputLinhas.value = qtd;
        gerarLinhas(qtd);
    });

    // Ao carregar a página, já gera o padrão de 30 linhas automaticamente
    gerarLinhas(30);
}
