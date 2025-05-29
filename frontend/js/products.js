import {getBackButton} from "./utils/backButton.js";
import {authFetch} from "./utils/authFetch.js";
import {notificar} from "./utils/notification.js";
import {confirmModal} from "./utils/confirmModal.js";
import {loadUserProfile} from "./utils/loadUserProfile.js";

let user = JSON.parse(localStorage.getItem('user'));
let appState = null; // Estado global da aplicação
let groupIdParam = null;
let listIdParam = null;
let categories = null;
let insights = null;
const appElement = document.getElementById('app'); // Elemento raiz da aplicação

/**
 * Função que retorna todas as categorias de Produtos
 * @returns {Promise<*>}
 */
async function loadProductCategories() {
    // Busca categorias de product da API
    const resposta = await authFetch('http://localhost:3000/api/groups/products/categories');
    return resposta.data;
}

/**
 * Carrega a lista de produtos da API.
 */
async function loadProducts() {
    const resposta = await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products`);
    return resposta.data || [];
}

async function loadInsights() {
    return await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/insights`);
}

/**
 * Inicializa o estado global da aplicação.
 */
async function initializeAppState(currentView, activeTab, products, product, user, mostrarProdutosVazios) {
    appState = {
        currentView,
        activeTab,
        products,
        product,
        user,
        mostrarProdutosVazios
    };
}

/**
 * Inicia a aplicação.
 */
async function startApp(
    currentView = "listaProdutos",
    activeTab = "meus-produtos",
    product = {},
    user = {},
    mostrarProdutosVazios = false
) {
    await clearCharts();
    insights = await loadInsights();
    let products = await loadProducts();
    await initializeAppState(currentView, activeTab, products, product, user, mostrarProdutosVazios);
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

    renderTabs();

    switch (appState.currentView) {
        case "listaProdutos":
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
        case "comprarProduto":
            renderComprarProduto();
            break;
        case "visualizarProdutosUsuario":
            renderVisualizarProdutosUsuario();
            break;
        default:
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
async function renderProdutos() {

    const titulo = document.createElement('h1');
    titulo.textContent = 'Produtos da Lista';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    const clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    appElement.appendChild(clearDiv);

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
        createButton.classList.add('save-btn');
        createButton.addEventListener('click', async (e) => {
            e.preventDefault();
            startApp("novoProduto")
        });
        emptyState.appendChild(createButton);

        appElement.appendChild(emptyState);
    } else {

        function hexToRgba(hex, alpha = 1) {
            const hexClean = hex.replace('#', '');
            const r = parseInt(hexClean.slice(0, 2), 16);
            const g = parseInt(hexClean.slice(2, 4), 16);
            const b = parseInt(hexClean.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        const productsDiv = document.createElement('div');
        productsDiv.style.maxHeight = '50dvh';
        productsDiv.style.overflow = 'auto';

        appState.products.forEach((product) => {
            const div = document.createElement("div");
            div.className = "item";

            const compradoPorMim = product.purchased_by === user.id;
            const adicionadoPorMim = product.added_by === user.id;
            const comprado = !!product.purchased_by;

            if (comprado) div.classList.add("comprado");

            div.innerHTML = `
                <div class="item-info">
                  <i class="fa-solid ${product.category_icon}" style="color: ${product.category_color}; background-color: ${hexToRgba(product.category_color, 0.1)}"></i>
                  <div class="div-info" style="display: flex; flex-direction: column">
                    <div style="display: flex; align-items: center; gap: 3px">
                        <strong>${product.product_name}</strong>|<span class="item-meta">${product.description}</span>
                    </div>
                    <div class="div-info" style="display: flex; align-items: center; gap: 3px">
                        ${comprado ? `<span>R$ ${parseFloat(product.price).toFixed(2)}</span> |` : ""}<span class="item-meta">Qtd. ${parseInt(product.quantity)}</span>
                    </div>
                    <span class="item-meta comprador">${comprado ? `Comprado por: ${product.purchased_name}` : `Adicionado por: ${product.added_name}`}</span>
                  </div>
                </div>
                ${comprado ? `<strong class="item-meta" style="margin-right: 12px">R$ ${(parseFloat(product.price) * parseInt(product.quantity)).toFixed(2)}</strong>` : ''}
                <div class="actions">
                  <button class="comprar"><i class="fa-solid"></i></button>
                  <button class="excluir" style="background-color: ${hexToRgba("#e12424", 0.2)}"><i class="fa-solid fa-trash" style="color:#e12424;"></i></button>
                </div>
              `;

            const buttonBuy = div.querySelector(".comprar");
            const buttonDelete = div.querySelector(".excluir");
            const icon = buttonBuy.querySelector("i");

            const naoMostrarDelete =
                (!compradoPorMim && !adicionadoPorMim) ||
                (!comprado && !adicionadoPorMim) ||
                (comprado && compradoPorMim && !adicionadoPorMim);

            if (naoMostrarDelete) {
                buttonDelete.style.display = 'none';
            }

            buttonDelete.addEventListener('click', async(e) => {
                e.stopPropagation();
                e.preventDefault();
                await deleteProduct(product);
            });

            // Adiciona o shake
            buttonDelete.addEventListener('mouseover', () => {
                const faIcon = buttonDelete.querySelector("i");
                faIcon.classList.add('fa-beat-fade');
            });

            // Remove o Shake
            buttonDelete.addEventListener('mouseleave', () => {
                const faIcon = buttonDelete.querySelector("i");
                faIcon.classList.remove('fa-beat-fade');
            });

            if (comprado) {
                // Estilo de "comprado"
                icon.className = "fa-solid fa-rotate-left";
                icon.style.color = "#b68713";
                buttonBuy.style.backgroundColor = hexToRgba("#b68713", 0.2);
                buttonBuy.classList.add("btn-amarelo");
                if(!compradoPorMim && !adicionadoPorMim) buttonBuy.style.display = "none";
                buttonBuy.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    await updateProductState(product, false);
                })
                // Adiciona o shake
                buttonBuy.addEventListener('mouseover', () => {
                    icon.classList.add('fa-spin');
                    icon.classList.add('fa-spin-reverse');
                });

                // Remove o Shake
                buttonBuy.addEventListener('mouseleave', () => {
                    icon.classList.remove('fa-spin');
                    icon.classList.remove('fa-spin-reverse');
                });
            } else {
                // Estilo de "não comprado"
                icon.className = "fa-solid fa-check";
                icon.style.color = "#4CAF50";
                buttonBuy.style.backgroundColor = hexToRgba("#4CAF50", 0.2);
                buttonBuy.classList.add("btn-verde");
                if(adicionadoPorMim) {
                    div.classList.add("clicavel");
                    div.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        await startApp("editarProduto", "meus-produtos", product)
                    });
                }
                buttonBuy.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    await startApp("comprarProduto", "meus-produtos",  product);
                })
                // Adiciona o shake
                buttonBuy.addEventListener('mouseover', () => {
                    icon.classList.add('fa-bounce');
                });

                // Remove o Shake
                buttonBuy.addEventListener('mouseleave', () => {
                    icon.classList.remove('fa-bounce');
                });
            }

            productsDiv.appendChild(div);

        });
        // Botão Criar
        const createButton = document.createElement('button');
        createButton.textContent = 'Adicionar Produto';
        createButton.style.width = '100%';
        createButton.classList.add('save-btn');
        createButton.addEventListener('click', async (e) => {
            e.preventDefault();
            startApp("novoProduto")
        });

        appElement.appendChild(productsDiv);
        appElement.appendChild(createButton);
    }
}

/**
 * Renderiza a tela de insights com gráficos.
 */
let pieChart, barChart, stackedChart;

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Configuração da interface inicial
function setupInsightsUI() {

    const filtroDiv = document.createElement('div');
    filtroDiv.id = 'filtroDiv';
    filtroDiv.style.textAlign = 'center';
    filtroDiv.style.margin = '10px';
    appElement.appendChild(filtroDiv);

    const filtroInput = document.createElement('input');
    filtroInput.type = 'text';
    filtroInput.placeholder = 'Filtrar por nome...';
    filtroInput.id = 'filtroUsuarios';
    filtroInput.style.width = '50%';
    filtroInput.style.marginBottom = '10px';
    filtroDiv.appendChild(filtroInput);

    const debounced = debounce( () => {
        const filtroValor = filtroInput.value.toLowerCase();
        atualizarGraficosELista(filtroValor);
    }, 300);

    filtroInput.addEventListener('input', debounced);

    const chartContainer = document.createElement('div');
    chartContainer.id = 'insightsChartContainer';
    chartContainer.style.display = 'flex';
    chartContainer.style.justifyContent = 'space-between';
    chartContainer.style.width = '100%';
    chartContainer.style.height = 'auto';
    chartContainer.style.paddingTop = '20px';
    appElement.appendChild(chartContainer);

    const chartContainerChild = document.createElement('div');
    chartContainerChild.id = 'insightsChartContainerChild';
    chartContainerChild.style.display = 'flex';
    chartContainerChild.style.justifyContent = 'space-between';
    chartContainerChild.style.width = '100%';
    chartContainerChild.style.height = 'auto';
    chartContainerChild.style.paddingTop = '20px';
    appElement.appendChild(chartContainerChild);

    const listaContainer = document.createElement('div');
    listaContainer.id = 'listaUsuariosContainer';
    listaContainer.style.marginTop = '20px';
    appElement.appendChild(listaContainer);
}

// Atualiza dados e gráficos com base no filtro
async function atualizarGraficosELista(filtro = '') {

    const categoriasBrutas = insights.totalByCategory.map(c => ({
        nome: c.name,
        valor: parseFloat(c.total)
    }));

    const usuarioInfoMap = {};

    insights.totalSpendingByUser.forEach(user => {
        usuarioInfoMap[user.name] = {
            id: user.userId,
            email: user.userEmail,
            total: user.amount
        };
    });

    const gastosPorUsuario = {};
    insights.categorySpendingByUser.forEach(user => {
        gastosPorUsuario[user.name] = {};
        Object.values(user.categories).forEach(categoryData => {
            gastosPorUsuario[user.name][categoryData.name] = categoryData.amount;
        });
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
        const cores = ['rgba(255,99,132,0.6)', 'rgba(54,162,235,0.6)', 'rgba(255,206,86,0.6)'];
        return {
            label: categoria,
            data: usuariosFiltrados.map(usuario => gastosPorUsuario[usuario][categoria] || 0),
            backgroundColor: cores[index % cores.length]
        };
    });

    await atualizarGraficos(categorias, categoriasBrutas, usuariosFiltrados, gastosPorUsuario, valoresCategorias, totalGastoFiltrado, valoresPessoasFiltradas, datasetsEmpilhado);
    await atualizarListaUsuarios(usuarioInfoListFiltrada);
}

// Atualização de gráficos
function atualizarGraficos(categorias, categoriasBrutas, usuariosFiltrados, gastosPorUsuario, valoresCategorias, totalGastoFiltrado, valoresPessoasFiltradas, datasetsEmpilhado) {

    let chartContainerChild = document.getElementById('insightsChartContainerChild');
    let chartContainer = document.getElementById('insightsChartContainer');
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

    if (valoresCategorias.length > 0) {
        const maxValor = Math.max(...valoresCategorias);
        const indexMaior = valoresCategorias.indexOf(maxValor);

        if (indexMaior !== -1 && categorias[indexMaior] !== undefined) {
            pieDetail.textContent = `Maior gasto: ${categorias[indexMaior]} (R$ ${valoresCategorias[indexMaior].toFixed(2)})`;
        } else {
            pieDetail.textContent = "Não foi possível determinar o maior gasto.";
        }
    } else {
        pieDetail.textContent = "Não há dados de categorias.";
    }

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
        chartContainerChild.appendChild(stackedWrapper);
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
                    x: {stacked: true},
                    y: {stacked: true}
                }
            }
        });
    } else {
        stackedChart.data.labels = usuariosFiltrados;
        stackedChart.data.datasets = datasetsEmpilhado;
        stackedChart.update();
    }
}

// Atualização da lista de usuários
function atualizarListaUsuarios(usuarios) {
    const listaContainer = document.getElementById('listaUsuariosContainer');
    listaContainer.innerHTML = '';
    listaContainer.style.maxHeight = '300px';
    listaContainer.style.overflowY = 'auto';

    usuarios.forEach(user => {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.border = '1px solid #ccc';
        container.style.padding = '10px';
        container.style.borderRadius = '8px';
        container.style.marginBottom = '10px';

        const info = document.createElement('div');
        const nome = document.createElement('strong');
        nome.textContent = user.nome;
        const email = document.createElement('p');
        email.textContent = user.email || `${user.nome.toLowerCase()}@email.com`;

        info.appendChild(nome);
        info.appendChild(email);

        const botaoContainer = document.createElement('div');
        const botao = document.createElement('button');
        botao.classList.add('save-btn');
        botao.textContent = 'Visualizar';
        botao.onclick = () => startApp("visualizarProdutosUsuario", "insights", null, user);

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

// Função principal
async function renderInsights() {

    const titulo = document.createElement('h1');
    titulo.id = 'insightsTitulo';
    titulo.textContent = 'Insights da Lista';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    if (!insights || !insights.totalByCategory?.length) {
        const subtitulo = document.createElement('p');
        subtitulo.textContent = 'Não existem produtos comprados para serem exibidos no gráfico dessa lista';
        subtitulo.style.textAlign = 'center';
        appElement.appendChild(subtitulo);
    } else {
        setupInsightsUI();
        await atualizarGraficosELista();
    }
}


// Visualizar Produtos Usuarios
async function renderVisualizarProdutosUsuario() {

    const resposta = await authFetch(`http://localhost:3000/api/member/lists/${listIdParam}/users/${appState.user.id}/products`)

    const produtos = await resposta.data;

    const titulo = document.createElement('h1');
    titulo.textContent = `Produtos comprados por ${appState.user.nome}`;
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

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
            tdValor.textContent = parseFloat(produto.price);

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

        const totalProducts = document.createElement('p');
        totalProducts.textContent = `Total: R$ ${parseFloat(total).toFixed(2)}`;
        totalProducts.style.fontWeight = 'bold';
        totalProducts.style.textAlign = 'right';
        totalProducts.style.fontSize = '24px';
        totalProducts.style.marginTop = '12px';
        totalProducts.style.marginRight = '8px';

        // Botão Voltar: igual ao groups (full width e margem inferior)
        const buttonVoltar = getBackButton()
        buttonVoltar.style.width = '100%';
        buttonVoltar.style.marginBottom = '10px';
        buttonVoltar.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await startApp("listaProdutos", "insights");
        });

        appElement.appendChild(tabela);
        appElement.appendChild(totalProducts);
        appElement.appendChild(buttonVoltar);
    }
}

// Limpa os Gráficos
function clearCharts() {
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    if (stackedChart) {
        stackedChart.destroy();
        stackedChart = null;
    }
}

/**
 * Renderiza a tela de gerenciamento de produto.
 * TO DO: Implementar criação e edição.
 */
async function renderGerenciarProduto() {

    // Define se estamos no fluxo de criação
    const isEditing = appState.currentView === 'editarProduto';
    let product = {id: "", product_name: "", description: "", quantity: "", price: "", category_name: ""};

    if(isEditing) {
        const data = await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${appState.product.product_id}`)
        product = data.data.rows[0];
    }

    // Título centralizado
    const titulo = document.createElement('h1');
    titulo.textContent = isEditing
        ? 'Editar Produto'
        : 'Criar Produto';
    titulo.style.textAlign = 'center';

    // Form
    const form = document.createElement('form');
    form.id = 'form-gerenciar-produto';
    form.style.marginTop = '20px';
    form.method = 'POST';
    form.appendChild(titulo);

    // --- Nome (sempre existe, mas só editável ao criar)
    const labelNome = document.createElement('label');
    labelNome.textContent = 'Nome:';
    form.appendChild(labelNome);

    const inputNome = document.createElement('input');
    inputNome.type = 'text';
    inputNome.id = 'inputName';
    inputNome.name = 'nome';
    inputNome.value = product.product_name;
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

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        selectCate.appendChild(opt);
    });

    form.appendChild(selectCate);

    const labelQuantidade = document.createElement('label');
    labelQuantidade.textContent = 'Quantidade:';
    form.appendChild(labelQuantidade);

    const inputQuantidade = document.createElement('input');
    inputQuantidade.type = 'number';
    inputQuantidade.id = 'inputQuan';
    inputQuantidade.name = 'quantidade';
    inputQuantidade.min = 1;
    inputQuantidade.value = isEditing? product.quantity : 1;
    inputQuantidade.required = true;
    form.appendChild(inputQuantidade);


    const crudBtns = document.createElement('div');
    crudBtns.classList.add('crud-div');

    // Botão Voltar: igual ao groups (full width e margem inferior)
    const buttonVoltar = getBackButton()
    buttonVoltar.style.width = '100%';
    buttonVoltar.classList.add('return.btn');
    buttonVoltar.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        startApp();
    });

    crudBtns.appendChild(buttonVoltar);

    // Botão salvar/criar: full width
    const buttonSalvar = document.createElement('button');
    buttonSalvar.textContent = isEditing ? 'Salvar' : 'Criar';
    buttonSalvar.classList.add('save-btn');
    buttonSalvar.style.width = '100%';
    form.addEventListener('submit', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await persistProduct(isEditing, product);
    })

    crudBtns.appendChild(buttonSalvar);
    // Botoes
    form.appendChild(crudBtns);
    // Formulário
    appElement.appendChild(form);
}

async function renderComprarProduto() {
    const product = appState.product;

    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    div.style.flexDirection = 'column';

    // Título
    const titulo = document.createElement('h1');
    titulo.textContent = 'Verificação de compra';
    titulo.style.textAlign = 'center';
    div.appendChild(titulo);

    // Seção de produto, quantidade e categoria
    const infoLinha = document.createElement('div');
    infoLinha.style.display = 'flex';
    infoLinha.style.flexDirection = 'column';
    infoLinha.style.alignItems = 'center';
    infoLinha.style.justifyContent = 'center';
    infoLinha.style.margin = '20px 0';

// Nome do produto em destaque
    const nomeProduto = document.createElement('h2');
    nomeProduto.innerHTML = `<i class="fas fa-box-open"></i> <strong>${product.product_name}</strong>`;
    nomeProduto.style.marginBottom = '5px';
    infoLinha.appendChild(nomeProduto);

// Quantidade
    const quantidade = document.createElement('div');
    quantidade.innerHTML = `<i class="fas fa-sort-numeric-up"></i> Quantidade: <strong>${product.quantity}</strong>`;
    quantidade.style.marginBottom = '5px';
    infoLinha.appendChild(quantidade);

// Categoria com ícone e cor
    const categoria = document.createElement('div');
    categoria.style.display = 'flex';
    categoria.style.alignItems = 'center';
    categoria.style.gap = '8px';

    const iconeCategoria = document.createElement('i');
    iconeCategoria.className = `fas ${product.category_icon}`;
    iconeCategoria.style.color = product.category_color;
    iconeCategoria.style.fontSize = '20px';

    const nomeCategoria = document.createElement('span');
    nomeCategoria.textContent = product.category_name;
    nomeCategoria.style.fontWeight = 'bold';

    categoria.appendChild(iconeCategoria);
    categoria.appendChild(nomeCategoria);
    infoLinha.appendChild(categoria);

    // Adiciona tudo ao app
    div.appendChild(infoLinha);


    // Info de quem adicionou
    const infoUser = document.createElement('div');
    infoUser.style.display = 'flex';
    infoUser.style.flexDirection = 'column';
    infoUser.style.alignItems = 'center';
    infoUser.style.marginBottom = '20px';

    const userName = document.createElement('div');
    userName.innerHTML = `<i class="fas fa-user"></i> Adicionado por: <strong>${product.added_name}</strong>`;
    const userEmail = document.createElement('div');
    userEmail.innerHTML = `<i class="fas fa-envelope"></i> ${product.added_email}`;
    userEmail.style.fontSize = '0.9em';

    infoUser.appendChild(userName);
    infoUser.appendChild(userEmail);
    div.appendChild(infoUser);

    // Formulário
    const form = document.createElement('form');
    form.id = 'form-compra-produto';
    form.style.marginTop = '20px';
    form.style.width = '50%';
    form.style.alignSelf = 'center';

    const labelBuyPrice = document.createElement('label');
    labelBuyPrice.textContent = 'Preço unitário:';
    form.appendChild(labelBuyPrice);

    const inputBuyPrice = document.createElement('input');
    inputBuyPrice.type = 'number';
    inputBuyPrice.id = 'inputBuyPrice';
    inputBuyPrice.name = 'price';
    inputBuyPrice.placeholder = 'Digite o preço do produto';
    inputBuyPrice.required = true;
    inputBuyPrice.step = '0.01';
    inputBuyPrice.min = '0';
    inputBuyPrice.style.display = 'block';
    inputBuyPrice.style.width = '100%';
    inputBuyPrice.style.margin = '5px 0 10px';
    form.appendChild(inputBuyPrice);

    // Total
    const totalWrapper = document.createElement('div');
    totalWrapper.style.display = 'flex';
    totalWrapper.style.justifyContent = 'space-between';
    totalWrapper.style.alignItems = 'center';
    totalWrapper.style.margin = '10px 0 20px';

    const totalLabel = document.createElement('span');
    totalLabel.innerHTML = `24 Total:`;

    const totalValue = document.createElement('strong');
    totalValue.textContent = 'R$ 0,00';

    totalWrapper.appendChild(totalLabel);
    totalWrapper.appendChild(totalValue);
    form.appendChild(totalWrapper);

    inputBuyPrice.addEventListener('input', () => {
        const unit = parseFloat(inputBuyPrice.value) || 0;
        const total = unit * product.quantity;
        totalValue.textContent = `R$ ${total.toFixed(2)}`;
    });

    // Botoes
    const crudBtns = document.createElement('div');
    crudBtns.classList.add('crud-div');

    const buttonVoltar = getBackButton();
    buttonVoltar.style.width = '100%';
    buttonVoltar.addEventListener('click', () => startApp());
    crudBtns.appendChild(buttonVoltar);

    const buttonConfirmarBuy = document.createElement('button');
    buttonConfirmarBuy.type = 'submit';
    buttonConfirmarBuy.classList.add('save-btn');
    buttonConfirmarBuy.textContent = 'Confirmar compra';
    buttonConfirmarBuy.style.width = '100%';

    buttonConfirmarBuy.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        await updateProductState(product, true);
    });
    crudBtns.appendChild(buttonConfirmarBuy);

    div.appendChild(form);
    appElement.appendChild(div);
    appElement.appendChild(crudBtns);
}

/**
 * Função para persistir Produtos
 * @param isEditing Boolean indicador de edição
 * @param product Produto a ser persistido
 * @returns {Promise<void>} Promise
 */
async function persistProduct(isEditing, product) {
    confirmModal(`Tem certeza que deseja ${isEditing ? 'Editar' : 'Criar'} o Produto ${product.product_name}`)
        .then(async resposta => {
            if (resposta) {
                const objeto = {
                    id: null,
                    name: document.getElementById('inputName').value,
                    description: document.getElementById('inputDesc').value,
                    categoryId: document.getElementById('inputCategory').value,
                    quantity: document.getElementById('inputQuan').value,
                    listId: listIdParam
                }

                const url = !isEditing
                    ? `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products`
                    : `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${product.product_id}`;
                const method = !isEditing
                    ? 'POST'
                    : 'PUT';

                await authFetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(objeto)
                }).then(data => {
                    notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                })
                await startApp();
            }
        });
}

/**
 * Função para Deletar um produto
 * @param product Produto a ser deletado.
 * @returns {Promise<void>}
 */
async function deleteProduct(product) {
    confirmModal(`Deseja excluir o produto: "${product.product_name}"?`)
        .then(async (resposta) => {
            if (resposta) {
                await authFetch(
                    `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${product.product_id}`,
                    {method: 'DELETE'}
                ).then(data => {
                    notificar(data.message)
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                })
                startApp();
            }
        })
}

async function updateProductState(product, buy) {
    let price = null
    if(buy) price = document.getElementById('inputBuyPrice').value;

    const body = buy ? { price: price } : {};

    confirmModal(`Tem certeza que deseja ${buy ? 'Realizar' : 'Desfazer'} a compra do Produto ${product.product_name}`)
        .then(async reposta => {
            if(reposta) {
                await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${product.product_id}/${buy ? 'buy' : 'sell'}`,
                    { method: 'PUT',
                        body: JSON.stringify(body)
                    }).then(data => {
                    notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                })
            await startApp();
            }
        })
}

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', async () => {
    await loadURLParams();
    await loadUserProfile();
    categories = await loadProductCategories();
    await startApp();
});