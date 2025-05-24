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

    appState.products = await loadProducts();

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
                    if(confirm("Reverter Compra")) {
                        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${product.product_id}/sell`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        alert(data.message);
                        await startApp("meusProdutos");
                    }
                })
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
                    startApp("comprarProduto", "meus-produtos",  product);
                })

            }

            buttonBuy.addEventListener("click",  (e) => {
                e.stopPropagation();
                const meta = div.querySelector(".comprador");

                if (div.classList.contains("comprado")) {
                    // Desfazer compra
                    div.classList.remove("comprado");
                    product.purchased_by = null;

                    meta.textContent = `Adicionado por: ${product.added_name}`;
                    icon.className = "fa-solid fa-check";
                    icon.style.color = "#4CAF50";
                    buttonBuy.style.backgroundColor = hexToRgba("#4CAF50", 0.2);
                    buttonBuy.classList.remove("btn-amarelo");
                    buttonBuy.classList.add("btn-verde");
                } else {
                    // Marcar como comprado
                    const comprador = product.purchased_name;
                    product.purchased_by = comprador;
                    product.purchased_name = comprador;

                    div.classList.add("comprado");
                    meta.textContent = `Comprado por: ${comprador}`;
                    icon.className = "fa-solid fa-rotate-left";
                    icon.style.color = "#b68713";
                    buttonBuy.style.backgroundColor = hexToRgba("#b68713", 0.2);
                    buttonBuy.classList.remove("btn-verde");
                    buttonBuy.classList.add("btn-amarelo");
                }
            });

            appElement.appendChild(div);

        });
        // Botão Criar
        const createButton = document.createElement('button');
        createButton.textContent = 'Adicionar Produto';
        createButton.style.width = '100%';
        createButton.addEventListener('click', async (e) => {
            e.preventDefault();
            startApp("novoProduto")
        });
        appElement.appendChild(createButton);
    }
}

/**
 * Renderiza a tela de insights com gráficos.
 */
let pieChart, barChart, stackedChart; // Variáveis para armazenar as instâncias dos gráficos

async function renderInsights(filtro = '') {
    const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/insights`);

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

    if (!data
        || data.totalByCategory.length === 0
        || data.totalSpendingByUser.length === 0
        || data.categorySpendingByUser.length === 0) {
        const subtitulo = document.createElement('h2');
        subtitulo.textContent = "Nenhum Gráfico para mostrar!";
    } else {
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
                    startApp("visualizarProdutosUsuario", "insights", null, user);
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
}


// Visualizar Produtos Usuarios
async function renderVisualizarProdutosUsuario() {

    const data = await fetchComToken(`http://localhost:3000/api/member/lists/${listIdParam}/users/${appState.user.id}/products`)

    const produtos = await data.data;

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
        const buttonVoltar = document.createElement('button');
        buttonVoltar.type = 'button';
        buttonVoltar.textContent = 'Voltar';
        buttonVoltar.style.display = 'block';
        buttonVoltar.style.width = '100%';
        buttonVoltar.style.marginBottom = '10px';
        buttonVoltar.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await clearCharts();
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
        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${appState.product.product_id}`)
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
    form.method = isEditing
        ? 'PUT'
        : 'POST';
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

    // Carrega as categorias e monta as opções
    const categories = await loadProductCategories();
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

    // Botão salvar/criar: full width
    const buttonSalvar = document.createElement('button');
    buttonSalvar.textContent = isEditing ? 'Salvar' : 'Criar';
    buttonSalvar.style.display = 'block';
    buttonSalvar.style.width = '100%';
    form.addEventListener('submit', async (e) => {
        e.stopPropagation();
        e.preventDefault();
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
            : `http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${appState.product.product_id}`;
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

async function renderComprarProduto() {

    const product = appState.product;
    // Título centralizado
    const titulo = document.createElement('h1');
    titulo.textContent = 'Verificação de compra';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Título centralizado
    const subTitulo = document.createElement('h2');
    subTitulo.textContent = `Produto: ${product.product_name}`;
    subTitulo.style.textAlign = 'center';
    appElement.appendChild(subTitulo);

    const quantidade = document.createElement('h2');
    quantidade.textContent = `Quantidade: ${product.quantity}`;
    quantidade.style.textAlign = 'center';
    appElement.appendChild(quantidade);

    // Cria o form
    const form = document.createElement('form');
    form.id = 'form-compra-produto';
    form.style.marginTop = '20px';

    // Label e input para preço
    const labelBuyPrice = document.createElement('label');
    labelBuyPrice.textContent = 'Preço:';
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
    inputBuyPrice.style.margin = '5px 0 15px';
    form.appendChild(inputBuyPrice);

    const buttonConfirmarBuy = document.createElement('button');
    buttonConfirmarBuy.type = 'submit';
    buttonConfirmarBuy.textContent = 'Confirmar compra';
    buttonConfirmarBuy.style.display = 'block';
    buttonConfirmarBuy.style.width = '100%';
    form.appendChild(buttonConfirmarBuy);
    buttonConfirmarBuy.addEventListener('click', async (e) => {
        e.preventDefault()

        const price = document.getElementById('inputBuyPrice').value;

        if(!price || price <= 0) {
            alert("Produto deve ter preço");
            return;
        }
        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listIdParam}/products/${appState.product.product_id}/buy`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                price: price
            })
        })
        alert(data.message);
        startApp();
    })

    const buttonVoltar = document.createElement('button');
    buttonVoltar.type = 'button';
    buttonVoltar.textContent = 'Voltar';
    buttonVoltar.style.display = 'block';
    buttonVoltar.style.width = '100%';
    buttonVoltar.style.marginBottom = '10px';
    buttonVoltar.addEventListener('click', () => startApp());
    form.appendChild(buttonVoltar);

    // Anexa o form ao container principal
    appElement.appendChild(form);
}

// =========================
// EVENTOS DOM
// =========================

// Inicialização ao carregar o DOM
document.addEventListener('DOMContentLoaded', async () => {
    await loadURLParams();
    await startApp();
});