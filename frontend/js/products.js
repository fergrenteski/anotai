// =========================
// VARIÁVEIS GLOBAIS
// =========================

let user = {};
let appState = null; // Estado global da aplicação
const appElement = document.getElementById('app'); // Elemento raiz da aplicação

// =========================
// FUNÇÃO COM TOKEN
// =========================

/**
 * Faz uma requisição fetch com token JWT da sessão.
 */
async function fetchComToken(url, options = {}) {
    const token = sessionStorage.getItem('token');

    if (!options.headers) options.headers = {};
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['Content-Type'] = "application/json";
    }

    const response = await fetch(url, options);

    return await response.json();
}

// =========================
// CARREGAMENTO DE DADOS
// =========================

/**
 * Carrega a lista de produtos da API.
 */
async function loadProducts() {
    const data = await fetchComToken('http://localhost:3000/api/groups/1/lists/1/products');

    if (!data.success) {
        alert("Erro: " + data.message);
        return;
    }
    user = data.user;
    // Define Iniciais de Perfil
    document.getElementById('userName').textContent = data.user.name;
    // Define as iniciais do usuário para o ícone
    document.getElementById('userInitials').textContent = data.user.name.split(' ').map(n => n[0]).join('');

    return data.data;
}

// =========================
// ESTADO E INICIALIZAÇÃO
// =========================

/**
 * Inicializa o estado global da aplicação.
 */
async function initializeAppState(currentView, activeTab, insights, productId, mostrarProdutosVazios) {
    const products = {};
    // await loadProducts();

    appState = {
        currentView,
        activeTab,
        products,
        insights,
        productId,
        mostrarProdutosVazios
    };
}

/**
 * Inicia a aplicação.
 */
async function startApp(
    currentView = "listaProdutos",
    activeTab = "meus-produtos",
    insights = [],
    productId = null,
    mostrarProdutosVazios = false
) {
    await initializeAppState(currentView, activeTab, insights, productId, mostrarProdutosVazios);
    renderApp();
}

// =========================
// RENDERIZAÇÃO
// =========================

/**
 * Renderiza a aplicação com base no estado atual.
 */
function renderApp() {
    appElement.innerHTML = '';

    switch (appState.currentView) {
        case "listaProdutos":
            renderTabs();
            switch (appState.activeTab) {
                case "meus-produtos":
                    renderProdutos();
                    break;
                case "insights":
                    renderInsights();
                    break;
                default:
                    break;
            }
            break;
        case "novoProduto":
        case "editarProduto":
            renderGerenciarProduto();
            break;
        default:
            renderTabs();
            renderProdutos();
    }
}

/**
 * Renderiza as abas de navegação.
 */
function renderTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const meusProdutosTab = document.createElement('div');
    meusProdutosTab.className = `tab ${appState.activeTab === 'meus-produtos' ? 'active' : ''}`;
    meusProdutosTab.textContent = 'Produtos da Lista';
    meusProdutosTab.addEventListener('click', () => startApp(null, 'meus-produtos'));
    tabsContainer.appendChild(meusProdutosTab);

    const insightsTab = document.createElement('div');
    insightsTab.className = `tab ${appState.activeTab === 'insights' ? 'active' : ''}`;
    insightsTab.textContent = 'Insights';
    insightsTab.addEventListener('click', () => startApp("listaProdutos", 'insights'));
    tabsContainer.appendChild(insightsTab);

    appElement.appendChild(tabsContainer);
}

/**
 * Renderiza a tela de produtos.
 */
function renderProdutos() {
    const titulo = document.createElement('h1');
    titulo.textContent = 'Produtos da Lista';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    const clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    appElement.appendChild(clearDiv);

    // Verifica se lista está vazia ou se deve forçar exibição de estado vazio
    if (appState.products || appState.products.length === 0 || appState.mostrarProdutosVazios) {
        const emptyState = document.createElement('div');
        emptyState.style.textAlign = 'center';

        const emptyTitle = document.createElement('h2');
        emptyTitle.textContent = 'Você não tem Produtos na Lista';
        emptyState.appendChild(emptyTitle);

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Adicione produtos na lista de compras para que os outros vejam.';
        emptyState.appendChild(emptyText);

        const createButton = document.createElement('button');
        createButton.textContent = 'Adicionar Produto';
        createButton.style.width = '100%';
        createButton.addEventListener('click', () => startApp("novoProduto"));
        emptyState.appendChild(createButton);

        appElement.appendChild(emptyState);
    } else {
        // TO DO: Renderizar os produtos
    }
}

/**
 * Renderiza a tela de insights com gráficos.
 */
function renderInsights() {
    // Dados brutos (exemplo: virão do banco futuramente)
    const categoriasBrutas = [
        { nome: 'Alimentos', valor: 295.90 },
        { nome: 'Bebidas', valor: 199.90 },
        { nome: 'Limpeza', valor: 76.00 },
        { nome: 'Higiene', valor: 42.00 },
        { nome: 'Pet', valor: 25.00 }
    ];

    const gastosPorUsuario = {
        'Luiz': { 'Alimentos': 50, 'Bebidas': 20, 'Limpeza': 10, 'Higiene': 5 },
        'Ana': { 'Alimentos': 70, 'Bebidas': 40, 'Limpeza': 20, 'Higiene': 10 },
        'Bernardo': { 'Alimentos': 90, 'Bebidas': 20, 'Limpeza': 30, 'Higiene': 5 },
        'Ryan': { 'Alimentos': 30, 'Bebidas': 25, 'Limpeza': 10, 'Higiene': 3 }
    };

    // Top 3 categorias por valor total
    const topCategorias = categoriasBrutas
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 3);
    const categorias = topCategorias.map(cat => cat.nome);
    const valoresCategorias = topCategorias.map(cat => cat.valor);

    // Gastos por pessoa para gráfico de barras
    const usuarios = Object.keys(gastosPorUsuario);
    const valoresPessoas = usuarios.map(usuario => {
        return Object.values(gastosPorUsuario[usuario]).reduce((a, b) => a + b, 0);
    });
    const totalGasto = valoresPessoas.reduce((a, b) => a + b, 0);

    // Prepara datasets para gráfico empilhado
    const datasetsEmpilhado = categorias.map((categoria, index) => {
        const cores = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
        ];
        return {
            label: categoria,
            data: usuarios.map(usuario => gastosPorUsuario[usuario][categoria] || 0),
            backgroundColor: cores[index % cores.length]
        };
    });

    // Elementos base
    const titulo = document.createElement('h1');
    titulo.textContent = 'Insights da Lista';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    const chartContainer = document.createElement('div');
    chartContainer.style.display = 'flex';
    chartContainer.style.justifyContent = 'space-between';
    chartContainer.style.width = '100%';
    chartContainer.style.height = 'auto';
    chartContainer.style.paddingTop = '20px';
    appElement.appendChild(chartContainer);

    // ---------- Gráfico de Pizza ----------
    const pieWrapper = document.createElement('div');
    pieWrapper.style.flex = '0 1 48%';
    pieWrapper.style.display = 'flex';
    pieWrapper.style.flexDirection = 'column';
    pieWrapper.style.alignItems = 'center';

    const pieTitle = document.createElement('h2');
    pieTitle.textContent = 'Gastos por Categoria (Top 3)';
    pieWrapper.appendChild(pieTitle);

    const pieCanvas = document.createElement('canvas');
    pieCanvas.id = 'myPieChart';
    pieCanvas.style.width = '100%';
    pieCanvas.style.height = '200px';
    pieWrapper.appendChild(pieCanvas);

    const indexMaior = valoresCategorias.indexOf(Math.max(...valoresCategorias));
    const pieDetail = document.createElement('p');
    pieDetail.textContent = `Maior gasto: ${categorias[indexMaior]} (R$ ${valoresCategorias[indexMaior].toFixed(2)})`;
    pieWrapper.appendChild(pieDetail);

    chartContainer.appendChild(pieWrapper);

    // ---------- Gráfico de Barras ----------
    const barWrapper = document.createElement('div');
    barWrapper.style.flex = '0 1 48%';
    barWrapper.style.display = 'flex';
    barWrapper.style.flexDirection = 'column';
    barWrapper.style.alignItems = 'center';

    const barTitle = document.createElement('h2');
    barTitle.textContent = 'Gastos por Pessoa';
    barWrapper.appendChild(barTitle);

    const barCanvas = document.createElement('canvas');
    barCanvas.id = 'myBarChart';
    barCanvas.style.width = '100%';
    barCanvas.style.height = '200px';
    barWrapper.appendChild(barCanvas);

    const barDetail = document.createElement('p');
    barDetail.textContent = `Total gasto: R$ ${totalGasto.toFixed(2)}`;
    barWrapper.appendChild(barDetail);

    chartContainer.appendChild(barWrapper);

    // ---------- Gráfico de Barras Empilhadas ----------
    const stackedWrapper = document.createElement('div');
    stackedWrapper.style.width = '100%';
    stackedWrapper.style.marginTop = '40px';
    stackedWrapper.style.display = 'flex';
    stackedWrapper.style.flexDirection = 'column';
    stackedWrapper.style.alignItems = 'center';

    const stackedTitle = document.createElement('h2');
    stackedTitle.textContent = 'Gastos por Categoria e Usuário (Top 3)';
    stackedWrapper.appendChild(stackedTitle);

    const stackedCanvas = document.createElement('canvas');
    stackedCanvas.id = 'stackedChart';
    stackedCanvas.style.width = '100%';
    stackedCanvas.style.height = '300px';
    stackedWrapper.appendChild(stackedCanvas);

    appElement.appendChild(stackedWrapper);

    // Renderização dos gráficos com Chart.js
    new Chart(pieCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Categorias',
                data: valoresCategorias,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    new Chart(barCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: usuarios,
            datasets: [{
                label: 'Gastos',
                data: valoresPessoas,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });

    new Chart(stackedCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: usuarios,
            datasets: datasetsEmpilhado
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true }
            }
        }
    });
}

/**
 * Renderiza a tela de gerenciamento de produto.
 * TO DO: Implementar criação e edição.
 */
async function renderGerenciarProduto() {
    // TO DO: Implementar renderização de formulário para novo ou editar produto
}

// =========================
// EVENTOS DOM
// =========================

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', async () => {
    await startApp();
});

