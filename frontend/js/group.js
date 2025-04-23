let currentGroupId = null;
let groups = [];
let members = [];
let categories = [];

async function fetchCategories() {
    const response = await fetch('http://localhost:3000/api/categories');
    categories = await response.json();
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

function openGroupForm(groupId = null) {
    currentGroupId = groupId;
    const modal = document.getElementById("groupFormModal");
    const form = document.getElementById("groupForm");
    const title = document.getElementById("formTitle");
    const submitButton = document.getElementById("submitGroupBtn");
    const membersContainer = document.getElementById("membersContainer");

    if (!groupId) {
        title.textContent = "Criar Novo Grupo";
        submitButton.textContent = "Criar Grupo";
        form.reset();
        document.getElementById("categorySelect").value = "";
        members = [];
        membersContainer.innerHTML = `<p id="noMembersText" class="no-members">Sem membros</p>`;
    } else {
        title.textContent = "Editar Grupo";
        submitButton.textContent = "Editar Grupo";

        const group = groups.find(g => g.id === groupId);
        document.getElementById("groupName").value = group.name;
        document.getElementById("categorySelect").value = group.category.id;
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
    const response = await fetch('http://localhost:3000/api/groups');
    // groups = await response.json();
    groups = [{id: 1, name: "grupo", description: "descricao", category: { id: 1, name: "categoria" } } ]
    const groupListContainer = document.getElementById('groupList');
    groupListContainer.innerHTML = '';

    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.innerHTML = `
            <strong>${group.name}</strong> - ${group.category.name}
            <p>${group.description}</p>
            <button onclick="openGroupForm(${group.id})">Editar</button>
            <button onclick="deleteGroup(${group.id})">Deletar</button>
        `;
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

    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: groupName,
            category: { id: categoryId },
            description: groupDescription
        }),
    });

    const data = await response.json();
    alert(`${currentGroupId ? 'Grupo editado' : 'Grupo criado'} com sucesso!`);
    closeGroupForm();
    fetchGroups();
});

async function deleteGroup(groupId) {
    await fetch(`http://localhost:3000/api/groups/${groupId}`, {
        method: 'DELETE',
    });
    alert('Grupo deletado!');
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
    if (!currentGroupId) return alert("Grupo ainda não foi criado!");

    const response = await fetch(`http://localhost:3000/api/groups/${currentGroupId}/members/${memberId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        members = members.filter(m => m.id !== memberId);
        updateMemberList();
        alert("Membro removido com sucesso!");
    } else {
        alert("Erro ao remover membro.");
    }
}

async function addMemberByEmail() {
    const email = document.getElementById("memberEmail").value;

    if (!currentGroupId) return alert("Você precisa criar o grupo antes de adicionar membros!");

    const response = await fetch(`http://localhost:3000/api/members?email=${email}`);
    if (response.ok) {
        const data = await response.json();

        const addResponse = await fetch(`http://localhost:3000/api/groups/${currentGroupId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ member_id: data.id })
        });

        if (addResponse.ok) {
            members.push(data);
            updateMemberList();
            document.getElementById("memberEmail").value = "";
            document.getElementById("memberErrorMessage").style.display = "none";
        } else {
            alert("Erro ao adicionar membro.");
        }
    } else {
        document.getElementById("memberErrorMessage").style.display = "block";
    }
}

fetchCategories();
fetchGroups();