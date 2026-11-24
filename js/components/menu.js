const links = [
    {
        icone: "event_available",
        texto: "Templates & Cronogramas",
        href: "#",
    },
    {
        icone: "table",
        texto: "Grade",
        href: "#",
    },
    {
        icone: "checklist",
        texto: "Questões e Simulados",
        href: "#",
    },
    {
        icone: "edit_line",
        texto: "Redação",
        href: "../pages/redacao.html",
    },
    {
        icone: "monitoring",
        texto: "Meu Desempenho",
        href: "#",
    },
    {
        icone: "settings",
        texto: "Mais Opções",
        href: "#",
        submenu: [
            {
                icone: "person",
                texto: "Perfil",
                href: "#",
            },
            {
                icone: "info",
                texto: "Sobre o Professor",
                href: "#",
            },
            {
                icone: "settings",
                texto: "Configurações",
                href: "#",
            }
        ]
    }
];

function criarNavBar() {
    const navbar = document.querySelector("#navbar");
    navbar.classList.add("navbar");
    // Criando a lista de links
    const logo = document.createElement("a");
    logo.href = "../";
    logo.classList.add("navbar-logo");
    // Adicionando a imagem da logo
    const logoImg = document.createElement("img");
    logoImg.src = "../assets/icons/logo-escopo-escuro.png"; // Caminho para o ícone da logo
    logoImg.alt = "Logotipo do site";

    logo.appendChild(logoImg);

    const navLinks = document.createElement("ul");
    navLinks.classList.add("navbar-links", "hidden"); // Adiciona a classe "hidden" inicialmente

    links.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.texto;

        const icon = document.createElement("span");
        icon.classList.add("material-symbols-rounded", "navbar-icon");
        icon.textContent = link.icone;

        if (link.submenu) {
            const submenu = document.createElement("ul");
            submenu.classList.add("navbar-submenu");

            link.submenu.forEach(sublink => {
                const subLi = document.createElement("li");
                const subA = document.createElement("a");
                const subIcon = document.createElement("span");
                subIcon.classList.add("material-symbols-rounded", "navbar-icon");
                subIcon.textContent = sublink.icone;
                subA.href = sublink.href;
                subA.textContent = sublink.texto;

                subA.prepend(subIcon); // Adiciona o ícone antes do texto
                subLi.appendChild(subA);
                submenu.appendChild(subLi);
                submenu.classList.add("hidden"); // Inicialmente esconde o submenu
                li.appendChild(submenu); // Adiciona o submenu ao item de menu principal
            })

            li.addEventListener("click", () => {
                submenu.classList.toggle("hidden"); // Alterna a visibilidade do submenu
            })
        }

        a.prepend(icon); // Adiciona o ícone antes do texto
        li.prepend(a);
        navLinks.appendChild(li);
    });

    const menu = document.createElement("button");
    menu.id = "navbar-menu"
    const menuIcon = document.createElement("span");
    menuIcon.classList.add("material-symbols-rounded", "navbar-icon");
    menuIcon.textContent = "menu";    

    menu.addEventListener("click", () => {
        navLinks.classList.toggle("hidden");
    })

    menu.appendChild(menuIcon);

    navbar.appendChild(logo);
    navbar.appendChild(navLinks);
    navbar.appendChild(menu);
}

criarNavBar();
