import {authFetch} from "./utils/authFetch.js";
import {confirmModal} from "./utils/confirmModal.js";
import {notificar} from "./utils/notification.js";
import {getBackButton} from "./utils/backButton.js";
import {createInput} from "./utils/createInput.js";
import {loadUserProfile} from "./utils/loadUserProfile.js";


// Variáveis
let user = JSON.parse(localStorage.getItem('user'));
let appState = null;
let categories = null;

/**
 * Funcão que retorna as Categorias dos grupos.
 * @returns {Promise<*>}
 */
async function loadGroupsCategories() {
    // Busca categorias de grupo da API
    const resposta = await authFetch('http://localhost:3000/api/groups/categories');
    return resposta.data;
}

/**
 * Funcão que retorna os grupos do usuário.
 * @returns {Promise<*[]>}
 */
async function loadGroups() {
    // Busca lista de grupos da API
    const resposta = await authFetch('http://localhost:3000/api/groups');
    return resposta.data || [];
}

/**
 * Funcão que retorna os Membros de um grupo.
 * @param groupId Identificador de Grupo.
 * @returns {Promise<*[]>}
 */
async function loadMembers(groupId) {
    const resposta = await authFetch(`http://localhost:3000/api/groups/${groupId}/members`);
    return resposta.data || [];
}

/**
 * Funcão que retorna os Convites de um usuário.
 * @returns {Promise<*[]>}
 */
async function loadInvites() {
    const resposta = await authFetch('http://localhost:3000/api/member/invites');
    return resposta.data || [];
}

async function initializeAppState(currentView, activeTab, groupId, mostrarGruposVazios) {
    let grupos = await loadGroups();
    let convites = await loadInvites();
    appState = {
        currentView: currentView,
        activeTab: activeTab,
        grupos: grupos,
        convites: convites || [],
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

    renderTabs();

    // Renderiza a view atual
    switch (appState.currentView) {
        case "listaGrupos":
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
    meusGruposTab.addEventListener('click', (e) => {
        e.preventDefault()
        startApp("listaGrupos", 'meus-grupos');
    });
    tabsContainer.appendChild(meusGruposTab);

    const convitesTab = document.createElement('div');
    convitesTab.className = `tab ${appState.activeTab === 'convites' ? 'active' : ''}`;
    convitesTab.textContent = `Convites (${appState.convites.length})`;
    convitesTab.addEventListener('click', (e) => {
        e.preventDefault()
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
        createButton.classList.add('save-btn');
        createButton.addEventListener('click', (e) => {
            e.preventDefault()
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
            groupType.textContent = grupo.category_name;
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
            editBtn.classList.add('action-btn');

            if (isAdminUser && grupo.user_verified) {
                editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
                editBtn.style.backgroundColor = '#e0f0ff'; // azul clarinho
                editBtn.style.color = '#007bff';           // azul
            } else if (!isAdminUser && grupo.user_verified) {
                editBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
                editBtn.style.backgroundColor = '#e6f9eb'; // verde clarinho
                editBtn.style.color = '#28a745';           // verde
            } else {
                editBtn.innerHTML = '<i class="fa-solid fa-envelope"></i>';
                editBtn.style.backgroundColor = '#fff8e1'; // amarelo clarinho
                editBtn.style.color = '#ffc107';           // amarelo
            }

            if (!grupo.user_verified) {
                editBtn.disabled = true;
            }

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault()
                startApp("editarGrupo", null, grupo.group_id);
            });
            actionButtons.appendChild(editBtn);

            if (isAdminUser) {
                const icon = document.createElement('i');
                icon.style.color = '#e12424';
                icon.className = 'fa-solid fa-trash';

                const deleteBtn = document.createElement('button');
                deleteBtn.appendChild(icon);
                deleteBtn.className = 'delete-btn';
                deleteBtn.classList.add('action-btn');
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    await deleteGroup(grupo);

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

            if (grupo.user_verified) groupItem.classList.add('click-group');

            // Evento de click para Redirecionar a listas do grupo.
            if (grupo.user_verified) groupItem.addEventListener('click', (e) => {
                e.preventDefault()
                e.stopPropagation();
                window.location.href = `lists.html?groupid=${grupo.group_id}`;
            })

            groupItem.appendChild(actionButtons);
            groupsContainer.appendChild(groupItem);
        });

        // Botão para criar novo grupo
        const createNewButton = document.createElement('button');
        createNewButton.textContent = 'Criar Novo Grupo';
        createNewButton.style.width = '100%';
        createNewButton.classList.add('save-btn');
        createNewButton.addEventListener('click', (e) => {
            e.preventDefault()
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
            groupType.textContent = convite.group_type;
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
            acceptBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #4CAF50"></i>';
            acceptBtn.className = 'accept-btn';
            acceptBtn.classList.add('action-btn');
            acceptBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await confirmModal(`Tem certeza que deseja aceitar o convite para o grupo "${convite.group_name}"`)
                    .then(async resposta => {
                        if (resposta) {
                            await authFetch(`http://localhost:3000/api/groups/${convite.group_id}/members/${convite.user_id}/invite/${convite.invite}/accept/${true}`,
                                {method: "POST"}).then(data => {
                                notificar(data.message);
                            }).catch(() => {
                                // Nada aqui. Silencia completamente.
                            });
                            startApp("listaGrupos", 'convites');
                        }
                    })
            });
            actionButtons.appendChild(acceptBtn);

            const rejectBtn = document.createElement('button');
            rejectBtn.innerHTML = '<i class="fa-solid fa-x" style="color: #f44336"></i>';
            rejectBtn.className = 'reject-btn';
            rejectBtn.classList.add('action-btn');
            rejectBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await confirmModal(`Tem certeza que deseja recusar o convite para o grupo "${convite.group_name}"`)
                    .then(async resposta => {
                        if (resposta) {
                            await authFetch(`http://localhost:3000/api/groups/${convite.group_id}/members/${convite.user_id}/invite/${convite.invite}/accept/${false}`,
                                {method: "POST"}).then(data => {
                               notificar(data.message);
                            }).catch(() => {
                                // Nada aqui. Silencia completamente.
                            });
                            startApp("listaGrupos", 'convites');
                        }
                    })
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
    let grupo = {group_name: "", description: "", category_name: ""};
    let data = {};
    let isAdminUser = false
    if (isEditing) {
        data = await authFetch(`http://localhost:3000/api/groups/${groupId}`);
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
    const form = document.createElement('form');
    form.method = 'POST';

    // Campo: Nome do grupo
    const nameInput = createInput('text', 'group-name', 'Nome do Grupo', grupo.group_name, true, !isAdminUser)
    form.appendChild(nameInput);

    const descriptionInput = createInput('text', 'group-description', 'Descrição do Grupo', grupo.description, true, !isAdminUser);
    form.appendChild(descriptionInput);

    // Campo: Tipo do grupo
    const typeSelect = document.createElement('select');
    typeSelect.id = 'group-type';
    typeSelect.required = true;
    typeSelect.disabled = !isAdminUser;

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Tipo de Grupo";
    defaultOption.disabled = true;
    defaultOption.selected = !grupo.category_name;
    typeSelect.appendChild(defaultOption);

    categories.forEach(type => {
        const {id, name} = type;
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        option.selected = name === grupo.category_name;
        typeSelect.appendChild(option);
    });

    form.appendChild(typeSelect);

    if (isEditing) {
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
                memberInfo.style.justifyContent = 'center';
                memberInfo.style.alignItems = 'center';

                const memberName = document.createElement('span');
                let statusText = '';
                if (membro.is_admin) {
                    statusText = ' (Administrador)';
                }
                memberName.textContent = membro.user_name + statusText;

                memberInfo.appendChild(memberName);

                const memberEmail = document.createElement('span');
                memberEmail.textContent = membro.user_email;
                memberEmail.style.fontSize = '12px';
                memberEmail.style.marginLeft = '8px';
                memberEmail.style.opacity = '0.6';

                memberInfo.appendChild(memberEmail);

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
                        removeBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            await removeMember(membro, grupo);
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

        if (isAdminUser) {
            const divMembers = document.createElement('div');
            divMembers.style.display = 'flex';
            divMembers.style.gap = '10px';
            divMembers.style.justifyContent = 'center';
            divMembers.style.alignItems = 'center';
            // Adicionar novo membro
            const newMemberInput = createInput('email', 'new-member', 'E-mail do novo membro', '', false)
            newMemberInput.style.marginBlock = '0px'
            divMembers.appendChild(newMemberInput);

            const addMemberBtn = document.createElement('button');
            addMemberBtn.textContent = '+';
            addMemberBtn.classList.add('add-member-btn');
            addMemberBtn.id = 'add-member-btn';
            addMemberBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                await addMember(newMemberInput, grupo);
            });
            divMembers.appendChild(addMemberBtn);
            form.appendChild(divMembers);
        }
    }

    const crudBtns = document.createElement('div');
    crudBtns.classList.add('crud-div');

    const backBtn = getBackButton();

    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startApp("listaGrupos", "meus-grupos");
    });

    crudBtns.appendChild(backBtn);

    if (isAdminUser) {
        // Botão salvar
        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Salvar Grupo';
        saveBtn.style.width = '100%';
        saveBtn.classList.add('save-btn');
        form.addEventListener('submit', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await persistGroup(isEditing, grupo);
        });
        crudBtns.appendChild(saveBtn);
    }

    form.appendChild(crudBtns);

    appElement.appendChild(form);
}


/**
 * Função para persistir Grupos
 * @param isEditing Boolean indicador de edição
 * @param grupo Grupo a ser persistido
 * @returns {Promise<void>} Promise
 */
async function persistGroup(isEditing, grupo) {

    const groupName = document.getElementById('group-name').value.trim();
    const groupDescription = document.getElementById('group-description').value.trim();
    const categoryId = document.getElementById('group-type').value;

    const url = isEditing
        ? `http://localhost:3000/api/groups/${grupo.group_id}`
        : 'http://localhost:3000/api/groups';
    const method = isEditing ? 'PUT' : 'POST';
    await confirmModal(`Tem certeza em ${isEditing ? 'editar' : 'criar'} o Grupo: ${groupName}`)
        .then(async resposta => {
            if (resposta) {
                await authFetch(url, {
                    method: method,
                    body: JSON.stringify({
                        name: groupName,
                        category: categoryId,
                        description: groupDescription
                    }),
                }).then(data => {
                   notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                });
                // Voltar para a lista de grupos
                await startApp("listaGrupos", "meus-grupos");
            }
        })
}

/**
 * Função para deletar Grupo.
 * @param grupo Grupo a ser deletado.
 * @returns {Promise<void>}
 */
async function deleteGroup(grupo) {
    await confirmModal(`Tem certeza que deseja excluir o grupo "${grupo.name}"?`)
        .then(async resposta => {
            if (resposta) {
                await authFetch(`http://localhost:3000/api/groups/${grupo.group_id}`,
                    {method: 'DELETE'}).then(data => {
                   notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                });
                await startApp();
            }
        });
}

/**
 * Função para Adicionar novo membro.
 * @param newMemberInput Elemento input do Membro.
 * @param grupo Grupo do membro.
 * @returns {Promise<void>} Promise
 */
async function addMember(newMemberInput, grupo) {
    const email = newMemberInput.value.trim();

    await authFetch(`http://localhost:3000/api/groups/${grupo.group_id}/members`,
        {
            method: "POST",
            body: JSON.stringify({
                email
            }),
        }).then(data => {
       notificar(data.message);
    }).catch(() => {
        // Nada aqui. Silencia completamente.
    });
    // Limpar campo
    newMemberInput.value = '';

    await startApp("editarGrupo", null, grupo.group_id);
}

/**
 * Remover membro de um grupo
 * @param membro Membro a ser removido
 * @param grupo Grupo do membro
 * @returns {Promise<void>} Promise
 */
async function removeMember(membro, grupo) {
    confirmModal(`Tem certeza que deseja remover: "${membro.user_name}"?`).then(async resposta => {
        if (resposta) {
            await authFetch(`http://localhost:3000/api/groups/${grupo.group_id}/members/${membro.user_id}`,
                {method: "DELETE"})
                .then(data => {
                   notificar(data.message);
                }).catch(() => {
                    // Nada aqui. Silencia completamente.
                });
            await startApp("editarGrupo", null, grupo.group_id);
        }
    })
}

/**
 * Função para Inicializar o Estado da Aplicação
 * @param currentView
 * @param activeTab
 * @param groupId
 * @param mostrarGruposVazios
 * @returns {Promise<void>}
 */
async function startApp(currentView = "listaGrupos", activeTab = "meus-grupos", groupId = null, mostrarGruposVazios = false) {
    await initializeAppState(currentView, activeTab, groupId, mostrarGruposVazios);
    renderApp();
}

document.addEventListener('DOMContentLoaded', async () => {
    categories = await loadGroupsCategories();
    await loadUserProfile();
    await startApp(); // Chama o start
});