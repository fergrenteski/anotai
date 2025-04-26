// Dados de exemplo
const grupos = [
    { id: 1, nome: "Churrasco", tipo: "outro", membros: [
        { email: "maria@email.com", isAdmin: true, verificado: true },
        { email: "joao@email.com", isAdmin: false, verificado: true },
        { email: "ana@email.com", isAdmin: false, verificado: false }
    ]},
    { id: 2, nome: "Lista do Mercado", tipo: "outro", membros: [
        { email: "maria@email.com", isAdmin: true, verificado: true },
        { email: "pedro@email.com", isAdmin: false, verificado: true },
        { email: "carlos@email.com", isAdmin: false, verificado: false }
    ]},
    { id: 3, nome: "Farmácia", tipo: "outro", membros: [
        { email: "maria@email.com", isAdmin: true, verificado: true },
        { email: "paulo@email.com", isAdmin: false, verificado: false }
    ]}
];

// Convites pendentes de exemplo
const convites = [
    { id: 1, grupoId: 4, nomeGrupo: "Material para Case", tipoGrupo: "trabalho", convidadoPor: "lucia@email.com" },
    { id: 2, grupoId: 5, nomeGrupo: "Material para Faculdade", tipoGrupo: "estudo", convidadoPor: "roberto@email.com" },
    { id: 3, grupoId: 6, nomeGrupo: "Grupo de Estudos", tipoGrupo: "estudo", convidadoPor: "carla@email.com" }
];

// Estado da aplicação
const appState = {
    currentView: "listaGrupos", // Pode ser: "listaGrupos", "novoGrupo", "editarGrupo", "convitesGrupo"
    activeTab: "meus-grupos", // Pode ser: "meus-grupos", "convites"
    grupos: grupos,
    convites: convites,
    grupoAtual: null,
    mostrarGruposVazios: false
};

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
        appState.activeTab = 'meus-grupos';
        renderApp();
    });
    tabsContainer.appendChild(meusGruposTab);
    
    const convitesTab = document.createElement('div');
    convitesTab.className = `tab ${appState.activeTab === 'convites' ? 'active' : ''}`;
    convitesTab.textContent = `Convites (${appState.convites.length})`;
    convitesTab.addEventListener('click', () => {
        appState.activeTab = 'convites';
        renderApp();
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

    // Botão para alternar visualização
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Alternar Visualização';
    toggleButton.style.marginBottom = '20px';
    toggleButton.style.float = 'right';
    toggleButton.addEventListener('click', () => {
        appState.mostrarGruposVazios = !appState.mostrarGruposVazios;
        renderApp();
    });
    appElement.appendChild(toggleButton);

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
            appState.currentView = "novoGrupo";
            appState.grupoAtual = null;
            renderApp();
        });
        emptyState.appendChild(createButton);
        
        appElement.appendChild(emptyState);
    } else {
        // Lista de grupos
        const groupsContainer = document.createElement('div');
        
        // Mostrar cada grupo
        appState.grupos.forEach(grupo => {
            const groupItem = document.createElement('div');
            groupItem.className = 'group-item';
            
            // Informações do grupo
            const groupInfo = document.createElement('div');
            
            const groupName = document.createElement('div');
            groupName.textContent = grupo.nome;
            groupName.style.fontWeight = 'bold';
            groupInfo.appendChild(groupName);
            
            const groupType = document.createElement('div');
            groupType.textContent = grupo.tipo.charAt(0).toUpperCase() + grupo.tipo.slice(1);
            groupType.style.fontSize = '14px';
            groupInfo.appendChild(groupType);
            
            // Contar membros verificados
            const verificados = grupo.membros.filter(m => m.verificado).length;
            const groupMembers = document.createElement('div');
            groupMembers.textContent = `${grupo.membros.length} membros (${verificados} verificados)`;
            groupMembers.style.fontSize = '14px';
            groupMembers.style.color = '#888';
            groupInfo.appendChild(groupMembers);
            
            groupItem.appendChild(groupInfo);
            
            // Botões de ação
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => {
                appState.currentView = "editarGrupo";
                appState.grupoAtual = grupo;
                renderApp();
            });
            actionButtons.appendChild(editBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja excluir o grupo "${grupo.nome}"?`)) {
                    appState.grupos = appState.grupos.filter(g => g.id !== grupo.id);
                    alert(`Grupo "${grupo.nome}" excluído com sucesso!`);
                    renderApp();
                }
            });
            actionButtons.appendChild(deleteBtn);
            
            groupItem.appendChild(actionButtons);
            groupsContainer.appendChild(groupItem);
        });
        
        // Botão para criar novo grupo
        const createNewButton = document.createElement('button');
        createNewButton.textContent = 'Criar Novo Grupo';
        createNewButton.style.width = '100%';
        createNewButton.addEventListener('click', () => {
            appState.currentView = "novoGrupo";
            appState.grupoAtual = null;
            renderApp();
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
            groupName.textContent = convite.nomeGrupo;
            groupName.style.fontWeight = 'bold';
            inviteInfo.appendChild(groupName);
            
            const groupType = document.createElement('div');
            groupType.textContent = convite.tipoGrupo.charAt(0).toUpperCase() + convite.tipoGrupo.slice(1);
            groupType.style.fontSize = '14px';
            inviteInfo.appendChild(groupType);
            
            const invitedBy = document.createElement('div');
            invitedBy.textContent = `Convidado por: ${convite.convidadoPor}`;
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
            acceptBtn.addEventListener('click', () => {
                // Simulando a aceitação do convite
                appState.convites = appState.convites.filter(c => c.id !== convite.id);
                alert(`Convite para o grupo "${convite.nomeGrupo}" aceito com sucesso!`);
                renderApp();
            });
            actionButtons.appendChild(acceptBtn);
            
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Recusar';
            rejectBtn.className = 'reject-btn';
            rejectBtn.addEventListener('click', () => {
                if (confirm(`Tem certeza que deseja recusar o convite para o grupo "${convite.nomeGrupo}"?`)) {
                    appState.convites = appState.convites.filter(c => c.id !== convite.id);
                    alert(`Convite para o grupo "${convite.nomeGrupo}" recusado.`);
                    renderApp();
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
function renderGerenciarGrupo() {
    const isEditing = appState.currentView === "editarGrupo";
    const grupo = appState.grupoAtual || { nome: "", tipo: "", membros: [] };
    
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
    nameInput.value = grupo.nome;
    nameInput.id = 'group-name';
    form.appendChild(nameInput);
    
    // Campo: Tipo do grupo
    const typeSelect = document.createElement('select');
    typeSelect.id = 'group-type';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Tipo de Grupo";
    defaultOption.disabled = true;
    defaultOption.selected = !grupo.tipo;
    typeSelect.appendChild(defaultOption);
    
    const types = ["trabalho", "estudo", "projeto", "outro"];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        option.selected = type === grupo.tipo;
        typeSelect.appendChild(option);
    });
    
    form.appendChild(typeSelect);
    
    // Seção de membros
    const membersTitle = document.createElement('h3');
    membersTitle.textContent = 'Membros do Grupo';
    membersTitle.style.textAlign = 'left';
    membersTitle.style.marginTop = '15px';
    form.appendChild(membersTitle);
    
    // Lista de membros
    const membersList = document.createElement('div');
    membersList.className = 'group-members';
    membersList.id = 'members-list';
    
    // Adicionar membros existentes
    if (grupo.membros.length > 0) {
        grupo.membros.forEach(membro => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            
            const memberInfo = document.createElement('div');
            memberInfo.style.display = 'flex';
            memberInfo.style.alignItems = 'center';
            
            const memberName = document.createElement('span');
            let statusText = '';
            if (membro.isAdmin) {
                statusText = ' (Administrador)';
            }
            memberName.textContent = membro.email + statusText;
            memberInfo.appendChild(memberName);
            
            // Indicador de verificação
            const verifiedIndicator = document.createElement('span');
            if (membro.verificado) {
                verifiedIndicator.className = 'verified-indicator';
                verifiedIndicator.textContent = 'Verificado';
            } else {
                verifiedIndicator.className = 'unverified-indicator';
                verifiedIndicator.textContent = 'Não verificado';
            }
            memberInfo.appendChild(verifiedIndicator);
            
            memberItem.appendChild(memberInfo);
            
            const actionButtons = document.createElement('div');
            actionButtons.className = 'action-buttons';
            
            // Botão alternar verificação
            const verifyBtn = document.createElement('button');
            verifyBtn.textContent = membro.verificado ? 'Remover Verificação' : 'Verificar';
            verifyBtn.style.background = membro.verificado ? '#FFC107' : '#4CAF50';
            verifyBtn.addEventListener('click', () => {
                membro.verificado = !membro.verificado;
                renderApp();
            });
            
            // Botão remover membro
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            
            if (membro.isAdmin) {
                removeBtn.textContent = 'Admin';
                removeBtn.disabled = true;
                removeBtn.style.opacity = '0.5';
            } else {
                removeBtn.textContent = 'Remover';
                removeBtn.addEventListener('click', () => {
                    membersList.removeChild(memberItem);
                });
            }
            
            // Adicionar botões às ações
            actionButtons.appendChild(verifyBtn);
            actionButtons.appendChild(removeBtn);
            memberItem.appendChild(actionButtons);
            
            membersList.appendChild(memberItem);
        });
    }
    
    form.appendChild(membersList);
    
    // Adicionar novo membro
    const newMemberInput = document.createElement('input');
    newMemberInput.type = 'email';
    newMemberInput.id = 'new-member';
    newMemberInput.placeholder = 'E-mail do novo membro';
    form.appendChild(newMemberInput);
    
    const addMemberBtn = document.createElement('button');
    addMemberBtn.textContent = 'Adicionar Membro';
    addMemberBtn.id = 'add-member-btn';
    addMemberBtn.addEventListener('click', () => {
        const email = newMemberInput.value.trim();
        if (!email) {
            alert('Por favor, informe o e-mail do novo membro!');
            return;
        }
        
        // Criar novo elemento de membro
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        
        const memberInfo = document.createElement('div');
        memberInfo.style.display = 'flex';
        memberInfo.style.alignItems = 'center';
        
        const memberName = document.createElement('span');
        memberName.textContent = email;
        memberInfo.appendChild(memberName);
        
        // Indicador de verificação (novo membro não é verificado)
        const verifiedIndicator = document.createElement('span');
        verifiedIndicator.className = 'unverified-indicator';
        verifiedIndicator.textContent = 'Não verificado';
        memberInfo.appendChild(verifiedIndicator);
        
        memberItem.appendChild(memberInfo);
        
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        
        // Botão para verificar
        const verifyBtn = document.createElement('button');
        verifyBtn.textContent = 'Verificar';
        verifyBtn.style.background = '#4CAF50';
        verifyBtn.addEventListener('click', () => {
            // Alternar a verificação
            const indicator = memberItem.querySelector('.unverified-indicator');
            if (indicator) {
                indicator.textContent = 'Verificado';
                indicator.className = 'verified-indicator';
                verifyBtn.textContent = 'Remover Verificação';
                verifyBtn.style.background = '#FFC107';
            } else {
                const indicator = memberItem.querySelector('.verified-indicator');
                indicator.textContent = 'Não verificado';
                indicator.className = 'unverified-indicator';
                verifyBtn.textContent = 'Verificar';
                verifyBtn.style.background = '#4CAF50';
            }
        });
        actionButtons.appendChild(verifyBtn);
        
        // Botão para remover
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remover';
        removeBtn.addEventListener('click', () => {
            membersList.removeChild(memberItem);
        });
        actionButtons.appendChild(removeBtn);
        
        memberItem.appendChild(actionButtons);
        membersList.appendChild(memberItem);
        
        // Limpar campo
        newMemberInput.value = '';
    });
    form.appendChild(addMemberBtn);
    
    // Botão salvar
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar Grupo';
    saveBtn.style.width = '100%';
    saveBtn.style.marginTop = '20px';
    saveBtn.addEventListener('click', () => {
        const groupName = document.getElementById('group-name').value.trim();
        const groupType = document.getElementById('group-type').value;
        
        if (!groupName) {
            alert('Por favor, informe o nome do grupo!');
            return;
        }
        
        if (!groupType) {
            alert('Por favor, selecione o tipo do grupo!');
            return;
        }
        
        // Coletar membros
        const membrosItems = document.querySelectorAll('.member-item');
        const membros = Array.from(membrosItems).map(item => {
            const email = item.querySelector('span').textContent.replace(' (Administrador)', '');
            const isAdmin = item.querySelector('span').textContent.includes('(Administrador)');
            const verificado = item.querySelector('.verified-indicator') !== null;
            return { email, isAdmin, verificado };
        });
        
        if (isEditing) {
            // Atualizar grupo existente
            const index = appState.grupos.findIndex(g => g.id === grupo.id);
            appState.grupos[index] = {
                ...grupo,
                nome: groupName,
                tipo: groupType,
                membros: membros
            };
        } else {
            // Criar novo grupo
            const novoId = Math.max(0, ...appState.grupos.map(g => g.id)) + 1;
            appState.grupos.push({
                id: novoId,
                nome: groupName,
                tipo: groupType,
                membros: membros
            });
        }
        
        // Mostrar mensagem de sucesso
        alert(`Grupo ${isEditing ? 'atualizado' : 'criado'} com sucesso!`);
        
        // Voltar para a lista de grupos
        appState.currentView = "listaGrupos";
        appState.activeTab = "meus-grupos";
        renderApp();
    });
    form.appendChild(saveBtn);
    
    // Botão voltar
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar';
    backBtn.style.width = '100%';
    backBtn.addEventListener('click', () => {
        appState.currentView = "listaGrupos";
        appState.activeTab = "meus-grupos";
        renderApp();
    });
    form.appendChild(backBtn);
    
    appElement.appendChild(form);
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
});
