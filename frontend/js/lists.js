import {authFetch} from "./utils/authFetch.js";
import {notificar} from "./utils/notification.js";
import {confirmModal} from "./utils/confirmModal.js";
import {createInput} from "./utils/createInput.js";
import {getBackButton} from "./utils/backButton.js";
import {loadUserProfile} from "./utils/loadUserProfile.js";

const params = new URLSearchParams(window.location.search);

// Variáveis
let user = JSON.parse(localStorage.getItem('user'));
let groupIdParam = null;
let appState = null;
let categories = null;

// Elemento raiz da aplicação
const appElement = document.getElementById('app');

async function loadListsCategories() {
    // Busca categorias de lista da API
    const resposta = await authFetch('http://localhost:3000/api/groups/lists/categories');
    return resposta.data;
}

async function loadLists() {
    // Busca lista de listas da API
    const resposta = await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists`);
    return resposta.data || [];
}

async function initializeAppState(currentView,
                                  activeTab,
                                  listId,
                                  mostrarListasVazios) {
    // Obtém as Listas
    let listas = await loadLists();
    // Monta o Objeto AppState
    appState = {
        currentView: currentView,
        activeTab: activeTab,
        listas: listas,
        listId: listId,
        mostrarListasVazios: mostrarListasVazios
    };
}

// Função principal para renderizar a interface
function renderApp() {
    // Limpa o conteúdo atual
    appElement.innerHTML = '';

    renderTabs();

    // Renderiza a view atual
    switch (appState.currentView) {
        case "listaListas":
            if (appState.activeTab === "minhas-listas") {
                renderListaListas();
            }
            break;
        case "novaLista":
            renderGerenciarLista();
            break;
        case "editarLista":
            renderGerenciarLista();
            break;
        default:
            renderListaListas();
    }
}

// Renderizar as abas
function renderTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const minhasListasTab = document.createElement('div');
    minhasListasTab.className = `tab ${appState.activeTab === 'minhas-listas' ? 'active' : ''}`;
    minhasListasTab.textContent = 'Minhas Listas';
    minhasListasTab.addEventListener('click', async () => {
        await startApp("listaListas", 'minhas-listas');
    });
    tabsContainer.appendChild(minhasListasTab);

    appElement.appendChild(tabsContainer);
}

// Renderizar a lista de listas
function renderListaListas() {
    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = 'Minhas Listas';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Container para limpar o float
    const clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    appElement.appendChild(clearDiv);

    // Verificar se deve mostrar lista de listas ou estado vazio
    if (appState.listas.length === 0 || appState.mostrarListasVazios) {
        // Estado vazio
        const emptyState = document.createElement('div');
        emptyState.style.textAlign = 'center';

        const emptyTitle = document.createElement('h2');
        emptyTitle.textContent = 'Você não tem listas';
        emptyState.appendChild(emptyTitle);

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Crie uma nova lista para começar a organizar suas anotações.';
        emptyState.appendChild(emptyText);

        const createButton = document.createElement('button');
        createButton.textContent = 'Criar Lista';
        createButton.style.width = '100%';
        createButton.addEventListener('click', async() => {
            await startApp("novaLista");
        });
        emptyState.appendChild(createButton);

        appElement.appendChild(emptyState);
    } else {
        // Lista de listas
        const listsContainer = document.createElement('div');

        // Mostrar cada lista
        appState.listas.forEach(lista => {
            let isAdminUser = lista.created_by === user.userId;
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            // Informações da lista
            const listInfo = document.createElement('div');

            const listName = document.createElement('div');
            listName.textContent = lista.list_name;
            listName.style.fontWeight = 'bold';
            listInfo.appendChild(listName);

            const listType = document.createElement('div');
            listType.textContent = lista.category_name;
            listType.style.fontSize = '14px';
            listInfo.appendChild(listType);

            listItem.appendChild(listInfo);

            // Botões de ação
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';


            const editBtn = document.createElement('button');

            if (isAdminUser) {
                editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                editBtn.style.backgroundColor = '#e0f0ff'; // azul clarinho
                editBtn.style.color = '#007bff';           // azul
            } else {
                editBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
                editBtn.style.backgroundColor = '#e6f9eb'; // verde clarinho
                editBtn.style.color = '#28a745';
            }

            editBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault()
                await startApp('editarLista', 'minhas-listas', lista.list_id);
            });

            // Adiciona os botões
            actionButtons.appendChild(editBtn);

            if(isAdminUser) {

                const icon = document.createElement('i');
                icon.style.color = '#e12424';
                icon.className = 'fa-solid fa-trash';

                const deleteBtn = document.createElement('button');
                deleteBtn.appendChild(icon);

                deleteBtn.className = 'delete-btn';
                deleteBtn.title = 'Excluir Lista';
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault()
                    await deleteList(lista);
                });

                // Adiciona o shake
                deleteBtn.addEventListener('mouseover', () => {
                    icon.classList.add('fa-beat-fade');
                });

                // Remove o Shake
                deleteBtn.addEventListener('mouseleave', () => {
                    icon.classList.remove('fa-beat-fade');
                });

                actionButtons.appendChild(deleteBtn);
            }

            listItem.classList.add('click-list');

            // Evento de click para Redirecionar a itens da lista.
            listItem.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault()
                window.location.href = `products.html?groupid=${lista.group_id}&listid=${lista.list_id}`;
            });

            listItem.appendChild(actionButtons);
            listsContainer.appendChild(listItem);
        });

        // Botão para criar nova lista
        const createNewButton = document.createElement('button');
        createNewButton.textContent = 'Criar Nova Lista';
        createNewButton.style.width = '100%';
        createNewButton.style.marginTop = '20px';
        createNewButton.addEventListener('click', async(e) => {
            e.stopPropagation();
            e.preventDefault()
            await startApp("novaLista");
        });
        listsContainer.appendChild(createNewButton);

        appElement.appendChild(listsContainer);
    }
}

/**
 * Delete a Lista de Compras.
 * @param lista Lista a ser excluída.
 * @returns {Promise<void>}
 */
async function deleteList(lista) {
    await confirmModal(`Tem certeza que deseja excluir a lista "${lista.list_name}"?`)
        .then(async resposta => {
            if(resposta) {
                // Deleta lista pela API
                await authFetch(`http://localhost:3000/api/groups/${lista.group_id}/lists/${lista.list_id}`, {
                    method: 'DELETE',
                }).then(data => {
                    if(data) {
                        notificar(data.message);
                    }
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                })
                await startApp();
            }
        })
}

// Renderizar tela de gerenciar lista (criar ou editar)
async function renderGerenciarLista() {
    const isEditing = appState.currentView === "editarLista";
    const listId = appState.listId;
    let lista = { list_name: "", description: "", category_name: "" };
    let isAdminUser = false;
    
    if (isEditing) {
        await authFetch(`http://localhost:3000/api/groups/${groupIdParam}/lists/${listId}`)
            .then(resposta => {
                if(resposta) {
                    lista = resposta.data;
                    isAdminUser = user.userId === lista.created_by;
                }
            }).catch(() => {
                // Nada aqui. Silencia completamente.
            })
    } else {
        isAdminUser = true;
    }

    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = isEditing ? 'Editar Lista' : 'Criar Lista';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Descrição
    const description = document.createElement('p');
    description.textContent = 'Crie ou edite sua lista.';
    description.style.textAlign = 'center';
    appElement.appendChild(description);

    // Formulário
    const form = document.createElement('form');
    form.method = 'POST';

    // Campo: Nome da lista
    const nameInput = createInput('text', 'list-name', 'Nome da Lista', lista.list_name ,true, !isAdminUser);
    form.appendChild(nameInput);

    const descriptionInput = createInput('text', 'list-description', 'Descrição da Lista', lista.description,true, !isAdminUser);
    form.appendChild(descriptionInput);

    // Campo: Tipo da lista
    const typeSelect = document.createElement('select');
    typeSelect.id = 'list-type';
    typeSelect.disabled = !isAdminUser;

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Tipo de Lista";
    defaultOption.disabled = true;
    defaultOption.selected = !lista.category_name;
    typeSelect.appendChild(defaultOption);

    categories.forEach(type => {
        const { id, name } = type;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        option.selected = name === lista.category_name;
        typeSelect.appendChild(option);
    });

    form.appendChild(typeSelect);

    const crudBtns = document.createElement('div');
    crudBtns.classList.add('crud-div');

    // Botão voltar
    const backBtn = getBackButton();

    backBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await startApp("listaListas", "minhas-listas");
    });

    crudBtns.appendChild(backBtn);

    if (isAdminUser) {
        // Botão salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar Lista';
        saveBtn.style.width = '100%';
        saveBtn.classList.add('save-btn');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await persistList(isEditing, lista);
        });
        crudBtns.appendChild(saveBtn);
    }

    form.appendChild(crudBtns);

    appElement.appendChild(form);
}

/**
 * Função para persistir Listas
 * @param isEditing Boolean indicador de edição
 * @param lista Lista a ser persistido
 * @returns {Promise<void>} Promise
 */
async function persistList(isEditing, lista) {
    const listName = document.getElementById('list-name').value.trim();
    const listDescription = document.getElementById('list-description').value.trim();
    const categoryId = document.getElementById('list-type').value;


    const url = isEditing
        ? `http://localhost:3000/api/groups/${groupIdParam}/lists/${lista.list_id}`
        : `http://localhost:3000/api/groups/${groupIdParam}/lists`;
    const method = isEditing ? 'PUT' : 'POST';

    await confirmModal(`Tem certeza que deseja ${isEditing ? 'Editar' : 'Criar'} a lista ${listName} ?`)
        .then(async resposta => {
            if(resposta) {
                await authFetch(url, {
                    method: method,
                    body: JSON.stringify({
                        name: listName,
                        categoryId: categoryId,
                        description: listDescription
                    })
                }).then(data => {
                    notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                });
                // Voltar para a lista de listas
                await startApp("listaListas", "minhas-listas");
            }
        });
}

// Inicializar a aplicação
async function startApp(currentView = "listaListas",
                        activeTab = "minhas-listas",
                        listId = null,
                        mostrarListasVazios = false) {
    await initializeAppState(currentView, activeTab, listId, mostrarListasVazios);
    renderApp();
}

document.addEventListener('DOMContentLoaded', async () => {
    groupIdParam = params.get("groupid");
    categories = await loadListsCategories();
    await loadUserProfile();
    await startApp(); // Chama o start
});