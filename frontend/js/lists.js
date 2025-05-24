var user = {};

URLSearchParams = new URLSearchParams(window.location.search);

let listIdParam = null;

async function fetchComToken(url, options = {}) {
    // Recupera token do sessionStorage
    const token = sessionStorage.getItem('token');
    if (!options.headers) {
        options.headers = {};
    }
    // Adiciona token e header JSON se disponível
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['Content-Type'] = "application/json";
    }
    const response = await fetch(url, options);
    // Redireciona para login se não autorizado
    if (response.status === 401) {
        window.location.href = '/index.html';
        return Promise.reject(new Error('Não autorizado. Redirecionando...'));
    }
    // Retorna resposta em JSON
    return await response.json();
}

async function loadListsCategories() {
    // Busca categorias de lista da API
    const data = await fetchComToken('http://localhost:3000/api/lists/categories');
    return data.data;
}

async function loadLists() {
    // Busca lista de listas da API
    const data = await fetchComToken('http://localhost:3000/api/lists');
    if (!data.success) {
        alert("Error: " + data.message);
        return;
    }
    user = data.user;
    // Define Iniciais de Perfil
    document.getElementById('userName').textContent = data.user.name;
    // Define as iniciais do usuário para o ícone
    document.getElementById('userInitials').textContent = data.user.name.split(' ').map(n => n[0]).join('');

    return data.data;
}

async function loadMembers(listId) {
    const data = await fetchComToken(`http://localhost:3000/api/lists/${listId}/members`);
    return data.data;
}

async function loadInvites() {
    const data = await fetchComToken('http://localhost:3000/api/member/invites');
    return data.data || [];
}

let appState = null; // Inicializa como nulo

async function initializeAppState(currentView,
                                  activeTab,
                                  listId,
                                  mostrarListasVazios) {

    listIdParam = URLSearchParams.get("listid");
    let listas = await loadLists();
    appState = {
        currentView: currentView,
        activeTab: activeTab,
        listas: listas,
        listId: listId,
        mostrarListasVazios: mostrarListasVazios
    };
}

// Elemento raiz da aplicação
const appElement = document.getElementById('app');

// Função principal para renderizar a interface
function renderApp() {
    // Limpa o conteúdo atual
    appElement.innerHTML = '';

    // Renderiza a view atual
    switch (appState.currentView) {
        case "listaListas":
            renderTabs();
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
            renderTabs();
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
    minhasListasTab.addEventListener('click', () => {
        startApp("listaListas", 'minhas-listas');
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
        createButton.addEventListener('click', () => {
            startApp("novaLista");
        });
        emptyState.appendChild(createButton);

        appElement.appendChild(emptyState);
    } else {
        // Lista de listas
        const listsContainer = document.createElement('div');

        // Mostrar cada lista
        appState.listas.forEach(lista => {
            let isAdminUser = Boolean(lista.is_admin);
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            // Informações da lista
            const listInfo = document.createElement('div');

            const listName = document.createElement('div');
            listName.textContent = lista.name;
            listName.style.fontWeight = 'bold';
            listInfo.appendChild(listName);

            const listType = document.createElement('div');
            listType.textContent = lista.category_name.charAt(0).toUpperCase() + lista.category_name.slice(1);
            listType.style.fontSize = '14px';
            listInfo.appendChild(listType);



            listItem.appendChild(listInfo);

            // Botões de ação
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';

            const editBtn = document.createElement('button');

            if (isAdminUser && lista.user_verified) {
                editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                editBtn.style.backgroundColor = '#e0f0ff'; // azul clarinho
                editBtn.style.color = '#007bff';           // azul
                editBtn.title = 'Editar Lista';
            } else if (!isAdminUser && lista.user_verified) {
                editBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
                editBtn.style.backgroundColor = '#e6f9eb'; // verde clarinho
                editBtn.style.color = '#28a745';           // verde
                editBtn.title = 'Visualizar Lista';
            } else {
                editBtn.innerHTML = '<i class="fa-solid fa-envelope"></i>';
                editBtn.style.backgroundColor = '#fff8e1'; // amarelo clarinho
                editBtn.style.color = '#ffc107';           // amarelo
                editBtn.title = 'Convite Pendente';
            }
            editBtn.className = 'edit-btn';

            if (!lista.user_verified) {
                editBtn.disabled = true;
            }

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startApp("editarLista", null, null, lista.list_id);
            });
            actionButtons.appendChild(editBtn);

            if (isAdminUser) {
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="color:#e12424;"></i>';
                deleteBtn.className = 'delete-btn';
                deleteBtn.title = 'Excluir Lista';
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`Tem certeza que deseja excluir a lista "${lista.name}"?`)) {
                        try {
                            // Deleta lista pela API
                            const data = await fetchComToken(`http://localhost:3000/api/lists/${lista.list_id}`, {
                                method: 'DELETE',
                            });
                            if (data.success) {
                                alert(`Lista "${lista.name}" excluída com sucesso!`);
                                startApp(); // Recarrega a aplicação
                            } else {
                                alert(data.error);
                            }
                        } catch (error) {
                            alert('Erro ao excluir a lista');
                        }
                    }
                });
                actionButtons.appendChild(deleteBtn);
            }

            if (lista.user_verified) listItem.classList.add('click-list');

            // Evento de click para Redirecionar a itens da lista.
            listItem.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `products.html?listid=${lista.list_id}`;
            });

            listItem.appendChild(actionButtons);
            listsContainer.appendChild(listItem);
        });

        // Botão para criar nova lista
        const createNewButton = document.createElement('button');
        createNewButton.textContent = 'Criar Nova Lista';
        createNewButton.style.width = '100%';
        createNewButton.style.marginTop = '20px';
        createNewButton.addEventListener('click', () => {
            startApp("novaLista");
        });
        listsContainer.appendChild(createNewButton);

        appElement.appendChild(listsContainer);
    }
}

// Renderizar tela de gerenciar lista (criar ou editar)
async function renderGerenciarLista() {
    const isEditing = appState.currentView === "editarLista";
    const listId = appState.listId;
    let lista = { list_name: "", description: "", category_name: "" };
    let data = {};
    let isAdminUser = false;
    
    if (isEditing) {
        data = await fetchComToken(`http://localhost:3000/api/lists/${listId}`);
        lista = data.data;
        user = data.user;
        isAdminUser = user.id === lista.user_admin_id;
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
    description.textContent = 'Crie ou edite sua lista, adicione membros e defina permissões.';
    description.style.textAlign = 'center';
    appElement.appendChild(description);

    // Formulário
    const form = document.createElement('div');

    // Campo: Nome da lista
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nome da Lista';
    nameInput.value = lista.list_name || '';
    nameInput.id = 'list-name';
    nameInput.disabled = !isAdminUser;
    form.appendChild(nameInput);

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Descrição da Lista';
    descriptionInput.value = lista.description || '';
    descriptionInput.id = 'list-description';
    descriptionInput.disabled = !isAdminUser;
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

    try {
        const types = await loadListsCategories();
        types.forEach(type => {
            const { id, name } = type;
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
            option.selected = name === lista.category_name;
            typeSelect.appendChild(option);
        });
    } catch (error) {
        alert('Erro ao carregar categorias de lista');
    }

    form.appendChild(typeSelect);

    if (isEditing) {
        // Seção de membros
        const membersTitle = document.createElement('h3');
        membersTitle.textContent = 'Membros da Lista';
        membersTitle.style.textAlign = 'left';
        membersTitle.style.marginTop = '15px';
        form.appendChild(membersTitle);
        
        const membros = await loadMembers(lista.list_id);
        
        // Lista de membros
        if (membros && membros.length > 0) {
            const membersList = document.createElement('div');
            membersList.className = 'list-members';
            membersList.id = 'members-list';
            
            // Adicionar membros existentes
            membros.forEach(membro => {
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';

                const memberInfo = document.createElement('div');
                memberInfo.style.display = 'flex';
                memberInfo.style.alignItems = 'center';

                const memberName = document.createElement('span');
                let statusText = '';
                if (membro.is_admin) {
                    statusText = ' (Administrador)';
                }
                memberName.textContent = membro.user_name + statusText;
                memberInfo.appendChild(memberName);

                if (isAdminUser) {
                    // Indicador de verificação
                    const verifiedIndicator = document.createElement('span');
                    if (membro.user_verified) {
                        verifiedIndicator.className = 'verified-indicator';
                        verifiedIndicator.textContent = 'Verificado';
                    } else {
                        verifiedIndicator.className = 'unverified-indicator';
                        verifiedIndicator.textContent = 'Não verificado';
                    }
                    memberInfo.appendChild(verifiedIndicator);
                }

                memberItem.appendChild(memberInfo);

                if (isAdminUser) {
                    const actionButtons = document.createElement('div');
                    actionButtons.className = 'action-buttons';

                    // Botão remover membro
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';
                    removeBtn.style.color = "#e12424";

                    if (membro.is_admin) {
                        removeBtn.textContent = 'Admin';
                        removeBtn.disabled = true;
                        removeBtn.style.backgroundColor = '#e0f0ff';
                        removeBtn.style.color = '#007bff';
                    } else {
                        removeBtn.textContent = 'Remover';
                        removeBtn.addEventListener('click', async () => {
                            if (confirm(`Tem certeza que deseja remover: "${membro.user_name}"?`)) {
                                const response = await fetchComToken(
                                    `http://localhost:3000/api/lists/${lista.list_id}/members/${membro.user_id}`,
                                    { method: "DELETE" }
                                );

                                alert(response.message);
                                startApp("editarLista", null, null, lista.list_id);
                            }
                        });
                    }
                    
                    actionButtons.appendChild(removeBtn);
                    memberItem.appendChild(actionButtons);
                }

                membersList.appendChild(memberItem);
            });
            form.appendChild(membersList);
        } else {
            const notHaveMembers = document.createElement('p');
            notHaveMembers.textContent = 'Sem Membros da Lista';
            form.appendChild(notHaveMembers);
        }

        if (isAdminUser) {
            // Adicionar novo membro
            const newMemberInput = document.createElement('input');
            newMemberInput.type = 'email';
            newMemberInput.id = 'new-member';
            newMemberInput.placeholder = 'E-mail do novo membro';
            form.appendChild(newMemberInput);

            const addMemberBtn = document.createElement('button');
            addMemberBtn.textContent = 'Adicionar Membro';
            addMemberBtn.id = 'add-member-btn';
            addMemberBtn.addEventListener('click', async () => {
                const email = newMemberInput.value.trim();
                if (!email) {
                    alert('Por favor, informe o e-mail do novo membro!');
                    return;
                }

                const response = await fetchComToken(`http://localhost:3000/api/lists/${lista.list_id}/members`, {
                    method: "POST",
                    body: JSON.stringify({ email }),
                });
                
                alert(response.message);
                // Limpar campo
                newMemberInput.value = '';
                startApp("editarLista", null, null, lista.list_id);
            });
            form.appendChild(addMemberBtn);
        }
    }

    if (isAdminUser) {
        // Botão salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar Lista';
        saveBtn.style.width = '100%';
        saveBtn.style.marginTop = '20px';
        saveBtn.addEventListener('click', async () => {
            const listName = document.getElementById('list-name').value.trim();
            const listDescription = document.getElementById('list-description').value.trim();
            const categoryId = document.getElementById('list-type').value;

            if (!listName) {
                alert('Por favor, informe o nome da lista!');
                return;
            }

            if (!categoryId) {
                alert('Por favor, selecione o tipo da lista!');
                return;
            }

            const url = isEditing
                ? `http://localhost:3000/api/lists/${lista.list_id}`
                : 'http://localhost:3000/api/lists';
            const method = isEditing ? 'PUT' : 'POST';
            
            const data = await fetchComToken(url, {
                method: method,
                body: JSON.stringify({
                    name: listName,
                    category: categoryId,
                    description: listDescription
                }),
            });
            
            if (data.success) {
                alert(`Lista ${isEditing ? 'atualizada' : 'criada'} com sucesso!`);
            } else {
                alert(`Lista não foi ${isEditing ? 'atualizada' : 'criada'}!`);
            }

            // Voltar para a lista de listas
            startApp("listaListas", "minhas-listas");
        });
        form.appendChild(saveBtn);
    }

    // Botão voltar
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar';
    backBtn.style.width = '100%';
    backBtn.addEventListener('click', () => {
        startApp("listaListas", "minhas-listas");
    });
    form.appendChild(backBtn);

    appElement.appendChild(form);
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
    await startApp(); // Chama o start
});