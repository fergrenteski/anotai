let currentGroupId = null;
let groups = [];
let members = [];
let categories = [];

async function fetchComToken(url, options = {}) {
    const token = sessionStorage.getItem('token'); // ou sessionStorage, se preferir
    if (!options.headers) {
        options.headers = {};
    }
    // Adiciona o token se estiver disponível
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
        options.headers['Content-Type'] = "application/json";
    }
    const response = await fetch(url, options);
    // Se não autorizado, redireciona
    if (response.status === 401) {
        window.location.href = '/index.html'; // ou a rota de login
        return Promise.reject(new Error('Não autorizado. Redirecionando...'));
    }
    return await response.json();
}

async function fetchCategories() {
    const data = await fetchComToken('http://localhost:3000/api/groups/categories');
    //
    categories = data.data;
    populateCategorySelect();
}

function populateCategorySelect() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="">Selecione uma Categoria</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

async function openGroupForm(groupId = null) {
    currentGroupId = groupId;
    const modal = document.getElementById("groupFormModal");
    const form = document.getElementById("groupForm");
    const title = document.getElementById("formTitle");
    const submitButton = document.getElementById("submitGroupBtn");
    const membersDiv = document.getElementById("memberList")

    if (!groupId) {
        title.textContent = "Criar Novo Grupo";
        submitButton.textContent = "Criar Grupo";
        form.reset();
        document.getElementById("categorySelect").value = "";
        members = [];
        membersDiv.style.display = "none";
    } else {
        membersDiv.style.display = "block";
        title.textContent = "Editar Grupo";
        submitButton.textContent = "Editar Grupo";

        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupId}`);
        if(!data.success) {
            alert(data.message); // TODO: Adicionar Mensagem
            return
        }
        const group = data.data;

        document.getElementById("groupName").value = group.group_name;
        document.getElementById("categorySelect").value = group.category_id;
        document.getElementById("groupDescription").value = group.description;

        fetch(`http://localhost:3000/api/groups/${groupId}/members`)
            .then(res => res.json())
            .then(res => {
                members = res.data;
                updateMemberList();
            });
    }

    modal.style.display = "block";
}

function closeGroupForm() {
    document.getElementById("groupFormModal").style.display = "none";
}

async function fetchGroups() {
    const data = await fetchComToken('http://localhost:3000/api/groups');

    if(!data.success) { alert("Error: ", data.message); return }; // TODO: Mensagem Personalizada
    //
    groups = data.data;
    //
    const groupListContainer = document.getElementById('groupList');
    groupListContainer.innerHTML = '';

    if(groups.length === 0 ) {
        groupListContainer.innerHTML = 'Nenhum grupo encontrado!';
    }

    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.innerHTML = `
            <strong>${group.name}</strong> - ${group.category_name}
            <p>${group.description}</p>
        `;
        // Redirecionamento ao clicar na div
        groupDiv.addEventListener('click', () => {
            window.location.href = `lists.html?groupId=${group.group_id}`;
        });
        // Adiciona botões se for admin
        if(group.is_admin) {
            const editButton = document.createElement('button');
            editButton.textContent = 'E';
            editButton.onclick = (event) => {
                event.stopPropagation(); // Impede o clique da div
                openGroupForm(group.group_id);
            };
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.onclick = (event) => {
                event.stopPropagation(); // Impede o clique da div
                deleteGroup(group.group_id);
            };
            groupDiv.appendChild(editButton);
            groupDiv.appendChild(deleteButton);
        }
    
        groupListContainer.appendChild(groupDiv);
    });
    
}

document.getElementById('groupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const groupName = document.getElementById('groupName').value;
    const categoryId = document.getElementById('categorySelect').value;
    const groupDescription = document.getElementById('groupDescription').value;

    const url = currentGroupId
        ? `http://localhost:3000/api/groups/${currentGroupId}`
        : 'http://localhost:3000/api/groups';

    const method = currentGroupId ? 'PUT' : 'POST';

    const data = await fetchComToken(url, {
        method: method,
        body: JSON.stringify({
            name: groupName,
            category: categoryId,
            description: groupDescription
        }),
    });
    
    if(data.success) {
        alert(data.message);
        fetchGroups();
    } else {
        alert(`${currentGroupId ? 'Grupo não foi editado' : 'Grupo não foi criado'}! ${data.message}`);
    }
    closeGroupForm();
});

async function deleteGroup(groupId) {
    await fetchComToken(`http://localhost:3000/api/groups/${groupId}`, {
        method: 'DELETE',
    });
    alert('Grupo deletado!'); // TODO: Mensagem Personalizada
    fetchGroups();
}

function updateMemberList() {
    const membersContainer = document.getElementById("membersContainer");
    const noMembersText = document.getElementById("noMembersText");

    if (members.length === 0) {
        noMembersText.style.display = "block";
        membersContainer.innerHTML = noMembersText.outerHTML;
    } else {
        noMembersText.style.display = "none";
        membersContainer.innerHTML = '';

        members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.classList.add('member');
            memberItem.innerHTML = `
                <span class="member-name">${member.name} - ${member.email}</span>
                <span class="member-status ${member.verified ? 'verified' : 'not-verified'}">
                    ${member.verified ? 'Verificado' : 'Não Verificado'}
                </span>
                <button onclick="removeMember('${member.id}')">Remover</button>
            `;
            membersContainer.appendChild(memberItem);
        });
    }
}

async function removeMember(memberId) {
    if (!currentGroupId) return alert("Grupo ainda não foi criado!"); // TODO: Mensagem Personalizada

    const data = await fetchComToken(`http://localhost:3000/api/groups/${currentGroupId}/members/${memberId}`, {
        method: 'DELETE',
    });

    if (data.success) {
        members = members.filter(m => m.id !== memberId);
        updateMemberList();
        alert("Membro removido com sucesso!"); // TODO: Mensagem Personalizada
    } else {
        alert("Erro ao remover membro."); // TODO: Mensagem Personalizada
    }
}

async function addMemberByEmail() {
    const email = document.getElementById("memberEmail").value;

    if (!currentGroupId) return alert("Você precisa criar o grupo antes de adicionar membros!"); // TODO: Mensagem Personalizada

    const data = await fetchComToken(`http://localhost:3000/api/members?email=${email}`);
    if (data.success) {

        const addResponse = await fetchComToken(`http://localhost:3000/api/groups/${currentGroupId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ member_id: data.id })
        });

        if (addResponse.success) {
            members.push(data);
            updateMemberList();
            document.getElementById("memberEmail").value = "";
            document.getElementById("memberErrorMessage").style.display = "none";
        } else {
            alert("Erro ao adicionar membro."); // TODO: Mensagem Personalizada
        }
    } else {
        document.getElementById("memberErrorMessage").style.display = "block";
    }
}

fetchCategories();
fetchGroups();