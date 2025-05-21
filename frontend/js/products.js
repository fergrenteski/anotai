// =========================
// VARIÁVEIS GLOBAIS
// =========================

let user = {};
let appState = null; // Estado global da aplicação
const appElement = document.getElementById('app'); // Elemento raiz da aplicação
let groupIdParam = null;
let listIdParam = null;

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

async function loadProductCategories() {
    // Busca categorias de product da API
    const data = await fetchComToken('http://localhost:3000/api/groups/products/categories');
    return data.data;
}

/**
 * Carrega a lista de produtos da API.
 */
async function loadProducts() {
    const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products`);

    user = data.user;
    // Define Iniciais de Perfil
    document.getElementById('userName').textContent = user.name;
    // Define as iniciais do usuário para o ícone
    document.getElementById('userInitials').textContent = user.name.split(' ').map(n => n[0]).join('');

    return data.data.rows;

}

// =========================
// ESTADO E INICIALIZAÇÃO
// =========================

/**
 * Inicializa o estado global da aplicação.
 */
async function initializeAppState(currentView, activeTab, products, insights, productId, mostrarProdutosVazios) {
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
    products = [],
    productId = null,
    mostrarProdutosVazios = false
) {
    await loadURLParams();
    products = await loadProducts();
    await initializeAppState(currentView, activeTab, products, insights, productId, mostrarProdutosVazios);
    renderApp();
}

async function loadURLParams() {
    // Obtém a string da query da URL atual
    const params = new URLSearchParams(window.location.search);

    // Acessa os parâmetros
    groupIdParam = params.get("groupid");
    listIdParam = params.get("listid");
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
            renderGerenciarProduto();
            break;
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
    if (!appState.products || appState.products.length === 0 || appState.mostrarProdutosVazios) {
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
        const productsContainer = document.createElement('div');

        appState.products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.className = 'product-item';
            productItem.style.display = 'flex';
            productItem.style.alignItems = 'center';
            productItem.style.marginBottom = '10px';
            productItem.style.justifyContent = 'space-evenly';
            productItem.style.padding = '5px';
            productItem.style.border = '1px solid #ccc';
            productItem.style.borderRadius = '5px';
            productItem.style.marginBottom = '10px';

            // Checkbox
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.flex = '0 0 5%';
            const checkBox = document.createElement('input');
            checkBox.type = 'checkbox';
            checkBox.style.margin = '0 0 0 0';
            checkBox.style.cursor = 'pointer';
            checkBox.style.transform = 'scale(1.7)';
            checkboxContainer.appendChild(checkBox);

            // Nome e Categoria
            const nameCategoryContainer = document.createElement('div');
            nameCategoryContainer.style.flex = '0 0 50%';
            nameCategoryContainer.style.display = 'flex';
            nameCategoryContainer.style.flexDirection = 'column';

            const productName = document.createElement('div');
            productName.textContent = product.product_name;
            productName.style.fontWeight = 'bold';
            productName.style.overflow = 'hidden';
            productName.style.textOverflow = 'ellipsis';
            productName.style.marginBottom = '4px';

            const productCategory = document.createElement('div');
            productCategory.textContent = product.category_name;
            productCategory.style.fontSize = '14px';

            nameCategoryContainer.appendChild(productName);
            nameCategoryContainer.appendChild(productCategory);

            // Quantidade e Total
            const quantityTotalContainer = document.createElement('div');
            quantityTotalContainer.style.flex = '0 0 15%';
            quantityTotalContainer.style.display = 'flex';
            quantityTotalContainer.style.flexDirection = 'column';
            quantityTotalContainer.style.alignItems = 'flex-start';

            const productQuantity = document.createElement('div');
            productQuantity.textContent = `Quantidade: ${product.quantity}`;
            productQuantity.style.marginBottom = '4px';

            const totalValue = product.quantity * product.price;
            const productTotal = document.createElement('div');
            productTotal.textContent = `Total: R$ ${totalValue.toFixed(2)}`;

            quantityTotalContainer.appendChild(productQuantity);
            quantityTotalContainer.appendChild(productTotal);

            // Excluir
            const deleteContainer = document.createElement('div');
            deleteContainer.style.flex = '0 0 10%';
            deleteContainer.style.textAlign = 'center';

            const deleteIcon = document.createElement('span');
            deleteIcon.className = 'material-symbols-outlined';
            deleteIcon.textContent = 'delete';  // o nome do ícone que você carregou
            deleteIcon.style.cursor = 'pointer';
            deleteIcon.style.color = '#ff0000';
            deleteContainer.appendChild(deleteIcon);

            productItem.appendChild(checkboxContainer);
            productItem.appendChild(nameCategoryContainer);
            productItem.appendChild(quantityTotalContainer);
            productItem.appendChild(deleteContainer);

            productsContainer.appendChild(productItem);

            deleteIcon.addEventListener('click', async () => {

                const  confirm = window.confirm(`Deseja excluir o produto: "${product.product_name}"?`);
                if (!confirm) return;

                await fetchComToken(
                    `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${product.product_id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    }
                )
                startApp();
            })

            // productInfo.addEventListener('click', () => startApp("editarProduto", null, null, null, product.product_id));
        });

        appElement.appendChild(productsContainer);

        const createButton = document.createElement('button');
        createButton.textContent = 'Adicionar Produto';
        createButton.style.width = '100%';
        createButton.style.fontSize = '13px';
        createButton.addEventListener('click', () => startApp("novoProduto"));
        appElement.appendChild(createButton);
    }
}

/**
 * Renderiza a tela de insights com gráficos.
 */
let pieChart, barChart, stackedChart; // Variáveis para armazenar as instâncias dos gráficos

async function renderInsights(filtro = '') {
    const data = await fetchComToken("http://localhost:3000/api/groups/1/lists/1/insights");

    const categoriasBrutas = data.totalByCategory.map(c => ({
        nome: c.name,
        valor: parseFloat(c.total)
    }));

    const usuarioInfoMap = {};

    data.totalSpendingByUser.forEach(user => {
        usuarioInfoMap[user.name] = {
            id: user.userId,
            email: user.userEmail,
            total: user.amount
        };
    });

    const gastosPorUsuario = {};
    data.categorySpendingByUser.forEach(user => {
        gastosPorUsuario[user.name] = {};
        for (const [categoryId, categoryData] of Object.entries(user.categories)) {
            gastosPorUsuario[user.name][categoryData.name] = categoryData.amount;
        }
    });

    const usuariosFiltrados = Object.keys(gastosPorUsuario).filter(nome => nome.toLowerCase().includes(filtro.toLowerCase()));

    // Aplica o filtro também ao usuarioInfoMap
    const usuarioInfoListFiltrada = usuariosFiltrados
        .filter(nome => usuarioInfoMap[nome]) // garante que o nome exista no map
        .map(nome => ({
            nome,
            ...usuarioInfoMap[nome]
        }));

    const topCategorias = categoriasBrutas
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 3);

    const categorias = topCategorias.map(cat => cat.nome);
    const valoresCategorias = topCategorias.map(cat => cat.valor);

    const valoresPessoasFiltradas = usuariosFiltrados.map(usuario => {
        return Object.values(gastosPorUsuario[usuario]).reduce((a, b) => a + b, 0);
    });
    const totalGastoFiltrado = valoresPessoasFiltradas.reduce((a, b) => a + b, 0);

    const datasetsEmpilhado = categorias.map((categoria, index) => {
        const cores = [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
        ];
        return {
            label: categoria,
            data: usuariosFiltrados.map(usuario => gastosPorUsuario[usuario][categoria] || 0),
            backgroundColor: cores[index % cores.length]
        };
    });

    // Elementos base
    let titulo = document.getElementById('insightsTitulo');
    if (!titulo) {
        titulo = document.createElement('h1');
        titulo.id = 'insightsTitulo';
        titulo.textContent = 'Insights da Lista';
        titulo.style.textAlign = 'center';
        appElement.appendChild(titulo);
    }

    let filtroDiv = document.getElementById('filtroDiv');
    if (!filtroDiv) {
        filtroDiv = document.createElement('div');
        filtroDiv.style.width = '100%';
        filtroDiv.id = 'filtroDiv';
        filtroDiv.style.textAlign = 'center';
        appElement.appendChild(filtroDiv);
    }

    // Adiciona o input de filtro
    let filtroInput = document.getElementById('filtroUsuarios');
    if (!filtroInput) {
        filtroInput = document.createElement('input');
        filtroInput.type = 'text';
        filtroInput.placeholder = 'Filtrar por nome...';
        filtroInput.id = 'filtroUsuarios';
        filtroInput.style.marginBottom = '10px';
        filtroInput.style.width = '50%';
        filtroDiv.appendChild(filtroInput);
    }

    let chartContainer = document.getElementById('insightsChartContainer');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.id = 'insightsChartContainer';
        chartContainer.style.display = 'flex';
        chartContainer.style.justifyContent = 'space-between';
        chartContainer.style.width = '100%';
        chartContainer.style.height = 'auto';
        chartContainer.style.paddingTop = '20px';
        appElement.appendChild(chartContainer);
    }

    // ---------- Gráfico de Pizza ----------
    let pieWrapper = document.getElementById('insightsPieWrapper');
    if (!pieWrapper) {
        pieWrapper = document.createElement('div');
        pieWrapper.id = 'insightsPieWrapper';
        pieWrapper.style.flex = '0 1 48%';
        pieWrapper.style.display = 'flex';
        pieWrapper.style.flexDirection = 'column';
        pieWrapper.style.alignItems = 'center';
        chartContainer.appendChild(pieWrapper);
    }


    let pieTitle = document.getElementById('insightsPieTitle');
    if (!pieTitle) {
        pieTitle = document.createElement('h2');
        pieTitle.id = 'insightsPieTitle';
        pieTitle.textContent = 'Gastos por Categoria (Top 3)';
        pieWrapper.appendChild(pieTitle);
    }

    let pieCanvas = document.getElementById('myPieChart');
    if (!pieCanvas) {
        pieCanvas = document.createElement('canvas');
        pieCanvas.id = 'myPieChart';
        pieCanvas.style.width = '100%';
        pieCanvas.style.height = '200px';
        pieWrapper.appendChild(pieCanvas);
    }

    let pieDetail = document.getElementById('insightsPieDetail');
    if (!pieDetail) {
        pieDetail = document.createElement('p');
        pieDetail.id = 'insightsPieDetail';
        pieWrapper.appendChild(pieDetail);
    }

    const indexMaior = valoresCategorias.indexOf(Math.max(...valoresCategorias));
    pieDetail.textContent = `Maior gasto: ${categorias[indexMaior]} (R$ ${valoresCategorias[indexMaior].toFixed(2)})`;


    // ---------- Gráfico de Barras ----------
    let barWrapper = document.getElementById('insightsBarWrapper');
    if (!barWrapper) {
        barWrapper = document.createElement('div');
        barWrapper.id = 'insightsBarWrapper';
        barWrapper.style.flex = '0 1 48%';
        barWrapper.style.display = 'flex';
        barWrapper.style.flexDirection = 'column';
        chartContainer.appendChild(barWrapper);
    }

    let barTitle = document.getElementById('insightsBarTitle');
    if (!barTitle) {
        barTitle = document.createElement('h2');
        barTitle.id = 'insightsBarTitle';
        barTitle.textContent = 'Gastos por Pessoa';
        barWrapper.appendChild(barTitle);
    }

    let barCanvas = document.getElementById('myBarChart');
    if (!barCanvas) {
        barCanvas = document.createElement('canvas');
        barCanvas.id = 'myBarChart';
        barCanvas.style.width = '100%';
        barCanvas.style.height = '200px';
        barWrapper.appendChild(barCanvas);
    }

    let barDetail = document.getElementById('insightsBarDetail');
    if (!barDetail) {
        barDetail = document.createElement('p');
        barDetail.id = 'insightsBarDetail';
        barWrapper.appendChild(barDetail);
    }
    barDetail.textContent = `Total gasto: R$ ${totalGastoFiltrado.toFixed(2)}`;


    // ---------- Gráfico de Barras Empilhadas ----------
    let stackedWrapper = document.getElementById('insightsStackedWrapper');
    if (!stackedWrapper) {
        stackedWrapper = document.createElement('div');
        stackedWrapper.id = 'insightsStackedWrapper';
        stackedWrapper.style.width = '100%';
        stackedWrapper.style.marginTop = '40px';
        stackedWrapper.style.display = 'flex';
        stackedWrapper.style.flexDirection = 'column';
        stackedWrapper.style.alignItems = 'center';
        appElement.appendChild(stackedWrapper);
    }

    let stackedTitle = document.getElementById('insightsStackedTitle');
    if (!stackedTitle) {
        stackedTitle = document.createElement('h2');
        stackedTitle.id = 'insightsStackedTitle';
        stackedTitle.textContent = 'Gastos por Categoria e Usuário (Top 3)';
        stackedWrapper.appendChild(stackedTitle);
    }

    let stackedCanvas = document.getElementById('stackedChart');
    if (!stackedCanvas) {
        stackedCanvas = document.createElement('canvas');
        stackedCanvas.id = 'stackedChart';
        stackedCanvas.style.width = '100%';
        stackedCanvas.style.height = '300px';
        stackedWrapper.appendChild(stackedCanvas);
    }



    // Renderização dos gráficos com Chart.js
    if (!pieChart) {
        pieChart = new Chart(pieCanvas.getContext('2d'), {
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
    } else {
        pieChart.data.labels = categorias;
        pieChart.data.datasets[0].data = valoresCategorias;
        pieChart.update();
    }

    if (!barChart) {
        barChart = new Chart(barCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: usuariosFiltrados,
                datasets: [{
                    label: 'Gastos',
                    data: valoresPessoasFiltradas,
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
    } else {
        barChart.data.labels = usuariosFiltrados;
        barChart.data.datasets[0].data = valoresPessoasFiltradas;
        barChart.update();
    }

    if (!stackedChart) {
        stackedChart = new Chart(stackedCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: usuariosFiltrados,
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
    } else {
        stackedChart.data.labels = usuariosFiltrados;
        stackedChart.data.datasets = datasetsEmpilhado;
        stackedChart.update();
    }



    // ---------- Lista de usuários ----------
    let listaUsuariosDiv = document.getElementById('listaUsuariosDiv');
    if (!listaUsuariosDiv) {
        listaUsuariosDiv = document.createElement('div');
        listaUsuariosDiv.id = 'listaUsuariosDiv';
        listaUsuariosDiv.style.marginTop = '40px';
        listaUsuariosDiv.style.width = '100%';
        appElement.appendChild(listaUsuariosDiv);
    }


    let tituloLista = document.getElementById('listaUsuariosTitulo');
    if (!tituloLista) {
        tituloLista = document.createElement('h2');
        tituloLista.id = 'listaUsuariosTitulo';
        tituloLista.textContent = 'Usuários';
        tituloLista.style.marginBottom = '10px';
        listaUsuariosDiv.appendChild(tituloLista);
    }


    let listaContainer = document.getElementById('listaUsuariosContainer');
    if (!listaContainer) {
        listaContainer = document.createElement('div');
        listaContainer.id = 'listaUsuariosContainer';
        listaUsuariosDiv.appendChild(listaContainer);
    }


    function renderListaUsuarios(usuariosParaRenderizar) {
        listaContainer.innerHTML = '';

        usuariosParaRenderizar.forEach(user => {
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
            nomeEl.textContent = user.nome;
            const emailEl = document.createElement('p');
            emailEl.textContent = `${user.nome.toLowerCase()}@email.com`;
            emailEl.style.fontSize = '0.9em';
            emailEl.style.margin = '2px 0 0 0';
            info.appendChild(nomeEl);
            info.appendChild(emailEl);

            const botaoContainer = document.createElement('div');
            botaoContainer.style.display = 'flex';
            botaoContainer.style.alignItems = 'center';

            const botao = document.createElement('button');
            botao.textContent = 'Visualizar';
            botao.addEventListener('click', async () => {
                startApp("visualizarProdutosUsuario", null, null, user.id);
            });

            const valor = document.createElement('span');
            valor.textContent = `R$ ${user.total.toFixed(2)}`;
            valor.style.color = 'red';
            valor.style.marginRight = '10px';
            botaoContainer.appendChild(valor);
            botaoContainer.appendChild(botao);

            container.appendChild(info);
            container.appendChild(botaoContainer);
            listaContainer.appendChild(container);
        });
    }

    // Chame a função para renderizar a lista inicial
    renderListaUsuarios(usuarioInfoListFiltrada);

    // Adiciona o evento de input ao filtro
    filtroInput.addEventListener('input', () => {
        const filtroValor = filtroInput.value.toLowerCase();
        renderInsights(filtroValor);
    });


}

// Visualizar Produtos Usuarios
async function renderVisualizarProdutosUsuario() {
    appElement.innerHTML = '';

    const titulo = document.createElement('h1');
    titulo.textContent = `Produtos comprados por ${appState.productId}`;
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    const data = await fetchComToken(`http://localhost:3000/api/member/lists/1/users/${appState.productId}/products`)

    const produtos = await data.data;

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

            const subtotal = parseFloat(produto.price) * parseInt(produto.quantity);
            total += subtotal;

            const tdNome = document.createElement('td');
            tdNome.textContent = produto.product_name;

            const tdCategoria = document.createElement('td');
            tdCategoria.textContent = produto.category_name;

            const tdValor = document.createElement('td');
            tdValor.textContent = `R$ ${parseFloat(produto.price).toFixed(2)}`;
            tdValor.style.textAlign = 'right';

            const tdQtd = document.createElement('td');
            tdQtd.textContent = parseInt(produto.quantity);

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
    // Limpa o container
    appElement.innerHTML = '';

    // Define se estamos no fluxo de criação
    const isEditing = appState.currentView === 'editarProduto';
    let product = {id: "", name: "", description: "", quantity: "", price: "", category_name: ""};

    if(isEditing) {

        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${appState.productId}`);
        product = data.data.rows[0];
    }

    // Título centralizado
    const titulo = document.createElement('h1');
    titulo.textContent = isEditing
        ? 'Criar Produto'
        : 'Editar Produto';
    titulo.style.textAlign = 'center';

    // Form
    const form = document.createElement('div');
    form.id = 'form-gerenciar-produto';
    form.style.marginTop = '20px';
    form.appendChild(titulo);

    // --- Nome (sempre existe, mas só editável ao criar)
    const labelNome = document.createElement('label');
    labelNome.textContent = 'Nome:';
    form.appendChild(labelNome);

    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.id = 'inputName';
    inputNome.name = 'nome';
    inputNome.value = product.name;
    inputNome.placeholder = 'Digite o nome do produto';
    inputNome.required = true;
    form.appendChild(inputNome);

    // --- Descrição:
    const labelDesc = document.createElement('label');
    labelDesc.textContent = 'Descrição:';
    form.appendChild(labelDesc);

    const inputDesc = document.createElement('input');
    inputDesc.type = 'text';
    inputDesc.id = 'inputDesc';
    inputDesc.name = 'descricao';
    inputDesc.value = product.description;
    inputDesc.placeholder = 'Digite a descrição';
    inputDesc.required = true;
    form.appendChild(inputDesc);

    // --- Categoria
    const labelCate = document.createElement('label');
    labelCate.textContent = 'Categoria:';
    form.appendChild(labelCate);

    // Cria o select
    const selectCate = document.createElement('select');
    selectCate.id = 'inputCategory';
    selectCate.name = 'category_id';
    selectCate.required = true;

    // Opção padrão
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Selecione uma categoria';
    defaultOpt.disabled = true;
    defaultOpt.selected = !product.category_name;
    selectCate.appendChild(defaultOpt);

    appElement.innerHTML = '';
    // Carrega as categorias e monta as opções
    const categories = await loadProductCategories();
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
        // se for edição, pré-seleciona a categoria do produto
        // if (isEditing && appState.currentProduct?.category_id === cat.id) {
        //     opt.selected = true;
        // }
        selectCate.appendChild(opt);
    });
    appElement.innerHTML = '';
    form.appendChild(selectCate);

    if (isEditing) {
        const labelQuantidade = document.createElement('label');
        labelQuantidade.textContent = 'Quantidade:';
        form.appendChild(labelQuantidade);

        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.id = 'inputQuan';
        inputQuantidade.name = 'quantidade';
        inputQuantidade.min = 0;
        inputQuantidade.required = true;
        form.appendChild(inputQuantidade);

        // Preço
        const labelPreco = document.createElement('label');
        labelPreco.textContent = 'Preço:';
        form.appendChild(labelPreco);

        const inputPreco = document.createElement('input');
        inputPreco.type = 'number';
        inputPreco.step = '0.01';
        inputPreco.id = 'inputPrice';
        inputPreco.name = 'preco';
        inputPreco.min = 0;
        inputPreco.required = true;
        form.appendChild(inputPreco);
    }

    // Botão salvar/criar: full width
    const buttonSalvar = document.createElement('button');
    buttonSalvar.textContent = isEditing ? 'Criar' : 'Salvar';
    buttonSalvar.style.display = 'block';
    buttonSalvar.style.width = '100%';
    buttonSalvar.addEventListener('click', async (e) => {
        e.preventDefault();
        const objeto = {
            id: null,
            name: document.getElementById('inputName').value,
            description: document.getElementById('inputDesc').value,
            categoryId: document.getElementById('inputCategory').value,
            listId: listIdParam
        }

        if (isEditing) {
            objeto.quantity = document.getElementById('inputQuan').value;
            objeto.price = document.getElementById('inputPrice').value;
        }

        const url = !isEditing
            ? `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products`
            : `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/:productId`;
        const method = !isEditing
            ? 'POST'
            : 'PUT';
        const data = await fetchComToken(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(objeto)
        })

        alert(data.message);

        if(data.success) {
            setTimeout(startApp, 1000);
        }
    })

    form.appendChild(buttonSalvar);

    // Botão Voltar: igual ao groups (full width e margem inferior)
    const buttonVoltar = document.createElement('button');
    buttonVoltar.type = 'button';
    buttonVoltar.textContent = 'Voltar';
    buttonVoltar.style.display = 'block';
    buttonVoltar.style.width = '100%';
    buttonVoltar.style.marginBottom = '10px';
    buttonVoltar.addEventListener('click', () => {
        startApp();
    });
    form.appendChild(buttonVoltar);

    appElement.appendChild(form);
}

// =========================
// EVENTOS DOM
// =========================

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', async () => {
    await startApp();
});