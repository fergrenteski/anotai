var user = {};

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

async function loadGroupsCategories() {
    // Busca categorias de grupo da API
    const data = await fetchComToken('http://localhost:3000/api/groups/categories');
    return data.data;
}

async function loadGroups() {
    // Busca lista de grupos da API
    const data = await fetchComToken('http://localhost:3000/api/groups');
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

function abrirPerfil() {
    alert("Página de perfil de usuário será implementada em breve!");
    // window.location.href = '/perfil.html';
}

function abrirListas() {
    alert("Listas de usuário será implementada em breve!");
    // window.location.href = '/lists.html';
}

function abrirHome() {
    window.location.href = 'home.html';
}

function logout() {
    sessionStorage.removeItem("token");
    alert(`Saindo...`);
    window.location.href = 'index.html';
}

async function loadMembers(groupId) {
    const data = await fetchComToken(`http://localhost:3000/api/groups/${groupId}/members`);
    return data.data;
}

async function loadInvites() {
    const data = await fetchComToken('http://localhost:3000/api/member/invites');
    return data.data || [];
}


let appState = null; // Inicializa como nulo

async function initializeAppState(currentView ,
                                  activeTab,
                                  convites,
                                  groupId,
                                  mostrarGruposVazios) {
    let grupos = await loadGroups();
    convites = await loadInvites();
    appState = {
        currentView: currentView,
        activeTab: activeTab,
        grupos: grupos,
        convites: convites,
        groupId: groupId,
        mostrarGruposVazios: mostrarGruposVazios
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
        case "listaGrupos":
            renderTabs();
            if (appState.activeTab === "meus-grupos") {
                renderListaGrupos();
            } else {
                renderConvitesGrupo();
            }
            break;
        case "novoGrupo":
            renderGerenciarGrupo();
            break;
        case "editarGrupo":
            renderGerenciarGrupo();
            break;
        default:
            renderTabs();
            renderListaGrupos();
    }
}

// Renderizar as abas
function renderTabs() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs';

    const meusGruposTab = document.createElement('div');
    meusGruposTab.className = `tab ${appState.activeTab === 'meus-grupos' ? 'active' : ''}`;
    meusGruposTab.textContent = 'Meus Grupos';
    meusGruposTab.addEventListener('click', () => {
        startApp("listaGrupos", 'meus-grupos');
    });
    tabsContainer.appendChild(meusGruposTab);

    const convitesTab = document.createElement('div');
    convitesTab.className = `tab ${appState.activeTab === 'convites' ? 'active' : ''}`;
    convitesTab.textContent = `Convites (${appState.convites.length})`;
    convitesTab.addEventListener('click', () => {
        startApp("listaGrupos", 'convites');
    });
    tabsContainer.appendChild(convitesTab);

    appElement.appendChild(tabsContainer);
}

// Renderizar a lista de grupos
function renderListaGrupos() {
    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = 'Meus Grupos';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Container para limpar o float
    const clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    appElement.appendChild(clearDiv);

    // Verificar se deve mostrar lista de grupos ou estado vazio
    if (appState.grupos.length === 0 || appState.mostrarGruposVazios) {
        // Estado vazio
        const emptyState = document.createElement('div');
        emptyState.style.textAlign = 'center';

        const emptyTitle = document.createElement('h2');
        emptyTitle.textContent = 'Você não tem grupos';
        emptyState.appendChild(emptyTitle);

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Crie um novo grupo para começar a colaborar com outras pessoas.';
        emptyState.appendChild(emptyText);

        const createButton = document.createElement('button');
        createButton.textContent = 'Criar Grupo';
        createButton.style.width = '100%';
        createButton.addEventListener('click', () => {
            startApp("novoGrupo");
        });
        emptyState.appendChild(createButton);

        appElement.appendChild(emptyState);
    } else {
        // Lista de grupos
        const groupsContainer = document.createElement('div');

        // Mostrar cada grupo
        appState.grupos.forEach(grupo => {
            let isAdminUser = Boolean(grupo.is_admin);
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';

            // Informações do grupo
            const groupInfo = document.createElement('div');

            const groupName = document.createElement('div');
            groupName.textContent = grupo.name;
            groupName.style.fontWeight = 'bold';
            groupInfo.appendChild(groupName);

            const groupType = document.createElement('div');
            groupType.textContent = grupo.category_name.charAt(0).toUpperCase() + grupo.category_name.slice(1);
            groupType.style.fontSize = '14px';
            groupInfo.appendChild(groupType);

            // Contar membros verificados
            // const verificados = grupo.membros.filter(m => m.verificado).length;
            // const groupMembers = document.createElement('div');
            // groupMembers.textContent = `${grupo.membros.length} membros (${verificados} verificados)`;
            // groupMembers.style.fontSize = '14px';
            // groupMembers.style.color = '#888';
            // groupInfo.appendChild(groupMembers);

            groupItem.appendChild(groupInfo);

            // Botões de ação
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';

            const editBtn = document.createElement('button');
            editBtn.textContent = isAdminUser && grupo.user_verified
                ? 'Editar'
                : !isAdminUser && grupo.user_verified
                    ? 'Visualizar'
                    : 'Não verificado';
            editBtn.className = 'edit-btn';
            if (!grupo.user_verified) {
                editBtn.disabled = true;
                editBtn.style.opacity = '0.5';
            }

            editBtn.addEventListener('click', () => {
                startApp("editarGrupo", null, null, grupo.group_id);
            });
            actionButtons.appendChild(editBtn);

            if(isAdminUser) {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Excluir';
                deleteBtn.className = 'delete-btn';
                deleteBtn.addEventListener('click', async () => {
                    if (confirm(`Tem certeza que deseja excluir o grupo "${grupo.name}"?`)) {

                        // Deleta grupo pela API
                        const data = await fetchComToken(`http://localhost:3000/api/groups/${grupo.group_id}`, {
                            method: 'DELETE',
                        });
                        if(data.success) {
                            alert(`Grupo "${grupo.name}" excluído com sucesso!`);
                        } else {
                            alert(data.error);
                        }
                        startApp();
                    }
                });
                actionButtons.appendChild(deleteBtn);
            }

            groupItem.appendChild(actionButtons);
            groupsContainer.appendChild(groupItem);
        });

        // Botão para criar novo grupo
        const createNewButton = document.createElement('button');
        createNewButton.textContent = 'Criar Novo Grupo';
        createNewButton.style.width = '100%';
        createNewButton.addEventListener('click', () => {
            startApp("novoGrupo");
        });
        groupsContainer.appendChild(createNewButton);

        appElement.appendChild(groupsContainer);
    }
}

// Renderizar tela de convites de grupo
function renderConvitesGrupo() {
    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = 'Convites de Grupo';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Verificar se há convites pendentes
    if (appState.convites.length === 0) {
        // Estado vazio
        const emptyState = document.createElement('div');
        emptyState.style.textAlign = 'center';

        const emptyTitle = document.createElement('h2');
        emptyTitle.textContent = 'Nenhum convite pendente';
        emptyState.appendChild(emptyTitle);

        const emptyText = document.createElement('p');
        emptyText.textContent = 'Você não tem nenhum convite para aceitar no momento.';
        emptyState.appendChild(emptyText);

        appElement.appendChild(emptyState);
    } else {
        // Lista de convites
        const invitesContainer = document.createElement('div');

        // Mostrar cada convite
        appState.convites.forEach(convite => {
            const inviteItem = document.createElement('div');
            inviteItem.className = 'invite-item';

            // Informações do convite
            const inviteInfo = document.createElement('div');

            const groupName = document.createElement('div');
            groupName.textContent = convite.group_name;
            groupName.style.fontWeight = 'bold';
            inviteInfo.appendChild(groupName);

            const groupType = document.createElement('div');
            groupType.textContent = convite.group_type.charAt(0).toUpperCase() + convite.group_type.slice(1);
            groupType.style.fontSize = '14px';
            inviteInfo.appendChild(groupType);

            const invitedBy = document.createElement('div');
            invitedBy.textContent = `Convidado por: ${convite.invited_by}`;
            invitedBy.style.fontSize = '14px';
            invitedBy.style.color = '#888';
            inviteInfo.appendChild(invitedBy);

            inviteItem.appendChild(inviteInfo);

            // Botões de ação
            const actionButtons = document.createElement('div');
            actionButtons.className = 'invite-buttons';

            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = 'Aceitar';
            acceptBtn.className = 'accept-btn';
            acceptBtn.addEventListener('click',  async(e) => {
                e.preventDefault();
                if (confirm(`Tem certeza que deseja aceitar o convite para o grupo "${convite.group_name}"`)) {
                    const data = await fetchComToken(`http://localhost:3000/api/groups/${convite.group_id}/members/${convite.user_id}/invite/${convite.invite}/accept/${true}`,
                        { method: "POST"});

                    alert(data.message);
                    if(data.success) {
                        startApp("listaGrupos", 'convites');
                    }
                }
            });
            actionButtons.appendChild(acceptBtn);

            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Recusar';
            rejectBtn.className = 'reject-btn';
            rejectBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm(`Tem certeza que deseja recusar o convite para o grupo "${convite.group_name}"?`)) {
                    const data = await fetchComToken(`http://localhost:3000/api/groups/${convite.group_id}/members/${convite.user_id}/invite/${convite.invite}/accept/${false}`,
                        { method: "POST"});

                    alert(data.message);
                    if(data.success) {
                        startApp("listaGrupos", 'convites');
                    }
                }
            });
            actionButtons.appendChild(rejectBtn);

            inviteItem.appendChild(actionButtons);
            invitesContainer.appendChild(inviteItem);
        });

        appElement.appendChild(invitesContainer);
    }
}

// Renderizar tela de gerenciar grupo (criar ou editar)
async function renderGerenciarGrupo() {
    const isEditing = appState.currentView === "editarGrupo";
    const groupId = appState.groupId;
    let grupo = { group_name: "", description: "", category_name: "" };
    let data = {};
    let isAdminUser = false
    if(isEditing) {
        data = await fetchComToken(`http://localhost:3000/api/groups/${groupId}`);
        grupo = data.data;
        user = data.user;
        isAdminUser = user.id === grupo.user_admin_id;
    } else {
        isAdminUser = true;
    }

    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = isEditing ? 'Editar Grupo' : 'Criar Grupo';
    titulo.style.textAlign = 'center';
    appElement.appendChild(titulo);

    // Descrição
    const description = document.createElement('p');
    description.textContent = 'Crie ou edite seu grupo, adicione membros e defina permissões.';
    description.style.textAlign = 'center';
    appElement.appendChild(description);

    // Formulário
    const form = document.createElement('div');

    // Campo: Nome do grupo
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nome do Grupo';
    nameInput.value = grupo.group_name;
    nameInput.id = 'group-name';
    nameInput.disabled = !isAdminUser;
    form.appendChild(nameInput);

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.placeholder = 'Descrição do Grupo';
    descriptionInput.value = grupo.description;
    descriptionInput.id = 'group-description';
    descriptionInput.disabled = !isAdminUser;
    form.appendChild(descriptionInput);

    // Campo: Tipo do grupo
    const typeSelect = document.createElement('select');
    typeSelect.id = 'group-type';
    typeSelect.disabled = !isAdminUser;

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Tipo de Grupo";
    defaultOption.disabled = true;
    defaultOption.selected = !grupo.category_name;
    typeSelect.appendChild(defaultOption);

    const types = await loadGroupsCategories();
    types.forEach(type => {
        const {id, name} = type;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        option.selected = name === grupo.category_name;
        typeSelect.appendChild(option);
    });

    form.appendChild(typeSelect);

    if(isEditing) {
        // Seção de membros
        const membersTitle = document.createElement('h3');
        membersTitle.textContent = 'Membros do Grupo';
        membersTitle.style.textAlign = 'left';
        membersTitle.style.marginTop = '15px';
        form.appendChild(membersTitle);
        const membros = await loadMembers(grupo.group_id)
        // Lista de membros
        if (membros.length > 0) {
            const membersList = document.createElement('div');
            membersList.className = 'group-members';
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

                if(isAdminUser) {
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

                if(isAdminUser) {
                    const actionButtons = document.createElement('div');
                    actionButtons.className = 'action-buttons';

                    // Botão remover membro
                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'remove-btn';

                    if (membro.is_admin) {
                        removeBtn.textContent = 'Admin';
                        removeBtn.disabled = true;
                        removeBtn.style.opacity = '0.5';
                    } else {
                        removeBtn.textContent = 'Remover';
                        removeBtn.addEventListener('click', async () => {
                            if (confirm(`Tem certeza que deseja remover: "${membro.user_name}"?`)) {
                                const response = await fetchComToken(
                                    `http://localhost:3000/api/groups/${grupo.group_id}/members/${membro.user_id}`,
                                    {method: "DELETE"});

                                alert(response.message);

                                startApp("editarGrupo", null, null, grupo.group_id);
                            }
                        });
                    }
                    // Adicionar botões às ações
                    actionButtons.appendChild(removeBtn);
                    memberItem.appendChild(actionButtons);
                }

                membersList.appendChild(memberItem);
            });
            form.appendChild(membersList);
        } else {
            const notHaveMembers = document.createElement('p');
            notHaveMembers.textContent = 'Sem Membros do Grupo';
            form.appendChild(notHaveMembers);
        }

        if(isAdminUser) {
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

                const response = await fetchComToken(`http://localhost:3000/api/groups/${grupo.group_id}/members` ,
                    { method: "POST" ,
                    body: JSON.stringify({
                        email
                    }),
                });
                alert(response.message);

                // Limpar campo
                newMemberInput.value = '';

                startApp("editarGrupo", null, null, grupo.group_id);
            });
            form.appendChild(addMemberBtn);
        }
    }
    if(isAdminUser) {
        // Botão salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar Grupo';
        saveBtn.style.width = '100%';
        saveBtn.style.marginTop = '20px';
        saveBtn.addEventListener('click', async () => {
            const groupName = document.getElementById('group-name').value.trim();
            const groupDescription = document.getElementById('group-description').value.trim();
            const categoryId = document.getElementById('group-type').value;

            if (!groupName) {
                alert('Por favor, informe o nome do grupo!');
                return;
            }

            if (!categoryId) {
                alert('Por favor, selecione o tipo do grupo!');
                return;
            }

            const url = isEditing
                ? `http://localhost:3000/api/groups/${grupo.group_id}`
                : 'http://localhost:3000/api/groups';
            const method = isEditing ? 'PUT' : 'POST';
            const data = await fetchComToken(url, {
                method: method,
                body: JSON.stringify({
                    name: groupName,
                    category: categoryId,
                    description: groupDescription
                }),
            });
            if(data.success) {
                // Mostrar mensagem de sucesso
                alert(`Grupo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
            } else {
                alert(`Grupo não foi${isEditing ? 'atualizado' : 'criado'}!`);
            }


            // Voltar para a lista de grupos
            startApp("listaGrupos", "meus-grupos");
        });
        form.appendChild(saveBtn);
    }

    // Botão voltar
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar';
    backBtn.style.width = '100%';
    backBtn.addEventListener('click', () => {
        startApp("listaGrupos", "meus-grupos");
    });
    form.appendChild(backBtn);

    appElement.appendChild(form);
}

// Inicializar a aplicação


async function startApp(currentView = "listaGrupos",
                        activeTab = "meus-grupos",
                        convites = [],
                        groupId =  null,
                        mostrarGruposVazios = false) {
    await initializeAppState(currentView ,
        activeTab,
        convites,
        groupId,
        mostrarGruposVazios); // Espera carregar dados
    renderApp();                // Só depois renderiza
}

document.addEventListener('DOMContentLoaded', async () => {
    await startApp(); // Chama o start
});

document.getElementById('userName').addEventListener('click', abrirPerfil);
document.getElementById('logo').addEventListener('click', abrirHome);
document.getElementById('list-link').addEventListener('click', abrirListas);
document.getElementById('logout').addEventListener('click', logout);