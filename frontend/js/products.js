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
        case "visualizarProdutosUsuario":
            renderVisualizarProdutosUsuario();
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
async function renderInsights() {

    const data = await fetchComToken("http://localhost:3000/api/groups/1/lists/1/insights");

    const categoriasBrutas = data.totalByCategory.map(c => ({
        nome: c.name,
        valor: parseFloat(c.total)
    }));

    const gastosPorUsuario = {};
    data.categorySpendingByUser.forEach(user => {
        gastosPorUsuario[user.name] = {};
        for (const [catData] of Object.entries(user.categories)) {
            gastosPorUsuario[user.name][catData.name] = catData.amount;
        }
    });

    const topCategorias = categoriasBrutas
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 3);

    const categorias = topCategorias.map(cat => cat.nome);
    const valoresCategorias = topCategorias.map(cat => cat.valor);

    const usuarios = Object.keys(gastosPorUsuario);
    const valoresPessoas = usuarios.map(usuario => {
        return Object.values(gastosPorUsuario[usuario]).reduce((a, b) => a + b, 0);
    });
    const totalGasto = valoresPessoas.reduce((a, b) => a + b, 0);

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

    // ---------- Lista de usuários ----------
    const listaUsuarios = document.createElement('div');
    listaUsuarios.style.marginTop = '40px';
    listaUsuarios.style.width = '100%';

    const tituloLista = document.createElement('h2');
    tituloLista.textContent = 'Usuários';
    tituloLista.style.marginBottom = '10px';
    listaUsuarios.appendChild(tituloLista);

    usuarios.forEach((nome, index) => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.border = '1px solid #ccc';
        container.style.padding = '10px';
        container.style.marginBottom = '10px';
        container.style.borderRadius = '8px';

        const info = document.createElement('div');
        const nomeEl = document.createElement('strong');
        nomeEl.textContent = nome;
        const emailEl = document.createElement('p');
        emailEl.textContent = `${nome.toLowerCase()}@email.com`;
        emailEl.style.fontSize = '0.9em';
        emailEl.style.margin = '2px 0 0 0';
        info.appendChild(nomeEl);
        info.appendChild(emailEl);

        const botaoContainer = document.createElement('div');
        botaoContainer.style.display = 'flex';
        botaoContainer.style.alignItems = 'center';

        const botao = document.createElement('button');
        botao.textContent = 'Visualizar';
        botao.addEventListener('click', () => {
            startApp("visualizarProdutosUsuario", null, null, nome);
        });

        const valor = document.createElement('span');
        valor.textContent = `R$ ${valoresPessoas[index].toFixed(2)}`;
        valor.style.color = 'red';
        valor.style.marginRight = '10px';
        botaoContainer.appendChild(valor);
        botaoContainer.appendChild(botao);

        container.appendChild(info);
        container.appendChild(botaoContainer);

        listaUsuarios.appendChild(container);
    });

    appElement.appendChild(listaUsuarios);


}

// Visualizar Produtos Usuarios
function renderVisualizarProdutosUsuario() {
    appElement.innerHTML = '';

    const titulo = document.createElement('h1');
    titulo.textContent = `Produtos comprados por ${appState.productId}`;
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Simulando produtos e valores por usuário (com categoria)
    const produtosFake = {
        'Luiz': [
            { nome: 'Arroz', categoria: 'Alimentos', valor: 20.00, quantidade: 2 },
            { nome: 'Feijão', categoria: 'Alimentos', valor: 10.50, quantidade: 3 },
            { nome: 'Refrigerante', categoria: 'Bebidas', valor: 5.90, quantidade: 4 }
        ],
        'Ana': [
            { nome: 'Leite', categoria: 'Bebidas', valor: 4.50, quantidade: 5 },
            { nome: 'Sabonete', categoria: 'Higiene', valor: 2.30, quantidade: 3 },
            { nome: 'Detergente', categoria: 'Limpeza', valor: 3.90, quantidade: 2 }
        ],
        'Bernardo': [
            { nome: 'Cerveja', categoria: 'Bebidas', valor: 7.00, quantidade: 6 },
            { nome: 'Ração', categoria: 'Pet', valor: 15.00, quantidade: 4 },
            { nome: 'Desinfetante', categoria: 'Limpeza', valor: 4.50, quantidade: 2 }
        ],
        'Ryan': [
            { nome: 'Papel Higiênico', categoria: 'Higiene', valor: 6.50, quantidade: 8 },
            { nome: 'Macarrão', categoria: 'Alimentos', valor: 3.00, quantidade: 4 }
        ]
    };

    const produtos = produtosFake[appState.productId] || [];

    if (produtos.length === 0) {
        const vazio = document.createElement('p');
        vazio.textContent = 'Nenhum produto encontrado para este usuário.';
        appElement.appendChild(vazio);
    } else {
        let total = 0;

        // Cria tabela
        const tabela = document.createElement('table');
        tabela.style.width = '100%';
        tabela.style.borderCollapse = 'collapse';
        tabela.style.marginTop = '20px';

        // Cabeçalho
        const thead = document.createElement('thead');
        const cabecalho = document.createElement('tr');
        ['Produto', 'Categoria', 'Preço', 'Quantidade', 'Preço Total'].forEach(texto => {
            const th = document.createElement('th');
            th.textContent = texto;
            th.style.borderBottom = '2px solid #000';
            th.style.padding = '8px';
            th.style.textAlign = 'center';
            cabecalho.appendChild(th);
        });
        thead.appendChild(cabecalho);
        tabela.appendChild(thead);

        // Corpo da tabela
        const tbody = document.createElement('tbody');
        tbody.style.textAlign = 'center';

        produtos.forEach(produto => {
            const linha = document.createElement('tr');

            const subtotal = produto.valor * produto.quantidade;
            total += subtotal;

            const tdNome = document.createElement('td');
            tdNome.textContent = produto.nome;

            const tdCategoria = document.createElement('td');
            tdCategoria.textContent = produto.categoria;

            const tdValor = document.createElement('td');
            tdValor.textContent = `R$ ${produto.valor.toFixed(2)}`;
            tdValor.style.textAlign = 'right';

            const tdQtd = document.createElement('td');
            tdQtd.textContent = produto.quantidade;

            const tdTotal = document.createElement('td');
            tdTotal.textContent = `R$ ${subtotal.toFixed(2)}`;
            tdTotal.style.fontWeight = 'bold';
            tdTotal.style.textAlign = 'right';

            [tdNome, tdCategoria, tdQtd, tdValor, tdTotal].forEach(td => {
                td.style.padding = '8px';
                td.style.borderBottom = '1px solid #ddd';
            });

            linha.appendChild(tdNome);
            linha.appendChild(tdCategoria);
            linha.appendChild(tdValor);
            linha.appendChild(tdQtd);
            linha.appendChild(tdTotal);
            tbody.appendChild(linha);
        });

        tabela.appendChild(tbody);
        appElement.appendChild(tabela);

        // Total geral
        const totalDiv = document.createElement('div');
        totalDiv.style.textAlign = 'right';
        totalDiv.style.marginTop = '10px';
        const totalTexto = document.createElement('strong');
        totalTexto.textContent = `Total: R$ ${total.toFixed(2)}`;
        totalTexto.style.marginRight = '8px';
        totalTexto.style.fontSize = '1.25em';
        totalDiv.appendChild(totalTexto);
        appElement.appendChild(totalDiv);
    }

    const voltar = document.createElement('button');
    voltar.textContent = '← Voltar';
    voltar.style.marginTop = '20px';
    voltar.addEventListener('click', () => startApp("listaProdutos", "insights"));
    appElement.appendChild(voltar);
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

