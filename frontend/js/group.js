import API_URLS from "./utils/env.js";

const url = API_URLS.GROUP_URL;

/**
 * Realiza uma requisição autenticada com JWT via sessionStorage.
 * @param {string} url - URL da API.
 * @param {object} [options={}] - Configurações adicionais do fetch.
 * @returns {Promise<Response>} - Promessa da resposta da API.
 */
function authFetch(url, options = {}) {
  const token = sessionStorage.getItem('token');
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`
  };
  return fetch(url, options);
}

//  Elementos da interface 
const groupsView = document.getElementById('groups-view');
const editGroupView = document.getElementById('edit-group-view');
const emptyState = document.getElementById('empty-state');
const groupsList = document.getElementById('groups-list');
const groupActionTitle = document.getElementById('group-action-title');
let currentGroupId = null;

/**
 * Exibe a visualização da lista de grupos.
 */
function showGroupsView() {
  editGroupView.classList.add('hidden');
  groupsView.classList.remove('hidden');
}

/**
 * Carrega e popula o select com os tipos de grupo.
 * @returns {Promise<void>}
 */
async function loadGroupTypes() {
  // const res = await authFetch(url + '/group_types');
  // const types = await res.json();
  const types = [
    { id: 1, name: "Família" },
    { id: 2, name: "Trabalho" },
    { id: 3, name: "Amigos" },
    { id: 4, name: "Projeto X" },
    { id: 5, name: "Turma da Faculdade" }
  ];
  const select = document.getElementById('group-type');
  select.innerHTML = '<option value="">Selecione</option>';
  types.forEach(type => {
    const opt = document.createElement('option');
    opt.value = type.id;
    opt.textContent = type.name;
    select.appendChild(opt);
  });
}

/**
 * Exibe o formulário de edição ou criação de grupo.
 * @param {string|null} [groupId=null] - ID do grupo a ser editado (null para novo grupo).
 * @returns {Promise<void>}
 */
async function showEditView(groupId = null) {
  currentGroupId = groupId;
  await loadGroupTypes();
  groupActionTitle.textContent = groupId ? "Editar Grupo" : "Criar Novo Grupo";

  const membersList = document.getElementById('members-list');
  membersList.innerHTML = '';

  if (groupId) {
    const response = await authFetch(`${url}/${groupId}`);
    const result = await response.json();

    const group = result.groups;
    
    document.getElementById('group-name').value = group.group_name;
    document.getElementById('group-type').value = group.category_id;

    // const membersRes = await authFetch(`${url}/${groupId}/members`);
    // const members = await membersRes.json();
    // members.forEach(member => {
    //   const item = document.createElement('div');
    //   item.className = 'member-item';
    //   item.innerHTML = `
    //     <span>${member.email}</span>
    //     <button class="remove-btn">Remover</button>
    //   `;
    //   item.querySelector('.remove-btn').addEventListener('click', () => item.remove());
    //   membersList.appendChild(item);
    // });
  } else {
    document.getElementById('group-name').value = '';
    document.getElementById('group-type').value = '';
  }

  groupsView.classList.add('hidden');
  editGroupView.classList.remove('hidden');
}

/**
 * Carrega e exibe todos os grupos cadastrados.
 * @returns {Promise<void>}
 */
async function loadGroups() {
  try {
    const response = await authFetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Erro ao carregar os grupos.');
    }

    const groupData = result.groups;

    groupsList.innerHTML = '';
    if (!groupData || groupData.length === 0) {
      emptyState.style.display = 'block';
      groupsList.style.display = 'none';
      return;
    }

    groupData.forEach(group => {
      const item = document.createElement('div');
      item.className = 'group-item';
      item.innerHTML = `
        <div class="group-info">
          <div class="group-title">${group.group_name}</div>
          <div class="group-type">${group.category_name}</div>
          <div class="group-members">${group.members_count} membros</div>
        </div>
        <div class="action-buttons">
          <button class="edit-btn" data-group-id="${group.group_id}">Editar</button>
          <button class="delete-btn" data-group-id="${group.group_id}">Excluir</button>
        </div>
      `;

      groupsList.appendChild(item);

      item.querySelector('.edit-btn').addEventListener('click', () => showEditView(group.group_id));
      item.querySelector('.delete-btn').addEventListener('click', () => deleteGroup(group.group_id, group.category_name, item));
    });

    emptyState.style.display = 'none';
    groupsList.style.display = 'block';

  } catch (error) {
    console.error('Erro ao carregar os grupos:', error);
    alert(`Erro ao carregar os grupos: ${error.message}`);
    groupsList.innerHTML = '';
    emptyState.style.display = 'block';
    groupsList.style.display = 'none';
  }
}

/**
 * Exclui um grupo e remove da lista.
 * @param {string} id - ID do grupo.
 * @param {string} name - Nome do grupo (para confirmação).
 * @param {HTMLElement} element - Elemento DOM a ser removido da lista.
 * @returns {Promise<void>}
 */
async function deleteGroup(id, name, element) {
  if (confirm(`Tem certeza que deseja excluir o grupo "${name}"?`)) {
    await authFetch(`${url}/${id}`, { method: 'DELETE' });
    element.remove();
    if (document.querySelectorAll('.group-item').length === 0) {
      emptyState.style.display = 'block';
      groupsList.style.display = 'none';
    }
  }
}

/**
 * Evento do botão "Criar Grupo" (quando lista está vazia).
 */
document.getElementById('create-group-btn').addEventListener('click', () => showEditView());

/**
 * Evento do botão "Criar Novo Grupo" (quando lista já está visível).
 */
document.getElementById('create-new-group-btn').addEventListener('click', () => showEditView());

/**
 * Evento do botão "Voltar" da view de edição.
 */
document.getElementById('back-btn').addEventListener('click', showGroupsView);

/**
 * Evento de adicionar novo membro ao grupo.
 */
document.getElementById('add-member-btn').addEventListener('click', () => {
  const email = document.getElementById('new-member').value;
  if (!email) {
    alert('Por favor, informe o e-mail do novo membro!');
    return;
  }

  const membersList = document.getElementById('members-list');
  const item = document.createElement('div');
  item.className = 'member-item';
  item.innerHTML = `
    <span>${email}</span>
    <button class="remove-btn">Remover</button>
  `;
  item.querySelector('.remove-btn').addEventListener('click', () => item.remove());
  membersList.appendChild(item);
  document.getElementById('new-member').value = '';
});

/**
 * Evento do botão de salvar grupo (criar ou editar).
 */
document.getElementById('save-group-btn').addEventListener('click', async () => {
  const name = document.getElementById('group-name').value;
  const typeId = document.getElementById('group-type').value;

  if (!name || !typeId) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  const members = Array.from(document.querySelectorAll('#members-list .member-item span'))
    .map(span => span.textContent);

  const payload = {
    name,
    type_id: typeId,
    members
  };

  if (currentGroupId) {
    await authFetch(`${url}/${currentGroupId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } else {
    await authFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  document.getElementById('success-msg').style.display = 'block';
  setTimeout(() => {
    document.getElementById('success-msg').style.display = 'none';
    showGroupsView();
    loadGroups(); // Recarrega a lista com o novo grupo
  }, 1500);
});

// Inicialização padrão da tela 
showGroupsView();
loadGroups();
