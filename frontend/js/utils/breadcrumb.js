// Mapa de cada página: nome e "pai lógico"
const breadcrumbMap = {
    'home.html': {name: 'Home', parent: null},
    'groups.html': {name: 'Grupos', parent: 'home.html'},
    'lists.html': {name: 'Listas', parent: 'groups.html'},
    'products.html': {name: 'Produtos', parent: 'lists.html'},
    'profile.html': {name: 'Perfil', parent: 'home.html'}
};

const container = document.getElementById('breadcrumb');

// Nome da página atual
const currentPage = location.pathname.split('/').pop() || 'home.html';

// Parâmetros da URL
const urlParams = new URLSearchParams(location.search);

// Constrói a trilha reversa
let path = [];
let page = currentPage;

while (page) {
    path.unshift(page);
    page = breadcrumbMap[page]?.parent;
}

// Monta o breadcrumb
path.forEach((page, i) => {
    if (i > 0) {
        const sep = document.createElement('span');
        sep.textContent = '>';
        container.appendChild(sep);
    }

    const name = breadcrumbMap[page].name;

    // Último item: só texto
    if (i === path.length - 1) {
        const span = document.createElement('span');
        span.textContent = name;
        span.classList.add('page-active');
        container.appendChild(span);
    } else {
        const a = document.createElement('a');
        a.textContent = name;

        // Lógica para remontar parâmetros importantes
        let href = page;
        if (page === 'groups.html') {
            // Sem parâmetros
        } else if (page === 'lists.html') {
            // Adiciona groupid
            const groupid = urlParams.get('groupid');
            if (groupid) href += `?groupid=${groupid}`;
        } else if (page === 'products.html') {
            // Não aplicável aqui, pois é a atual
        }

        a.href = href;
        container.appendChild(a);
    }
});
