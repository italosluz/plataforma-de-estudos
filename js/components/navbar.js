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
        texto: "Configurações",
        href: "#"
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
    navLinks.classList.add("navbar-links");

    links.forEach((link) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.texto;
        const icon = document.createElement("span");
        icon.classList.add("material-symbols-rounded", "navbar-icon");
        icon.textContent = link.icone;

        a.prepend(icon); // Adiciona o ícone antes do texto
        li.appendChild(a);
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
