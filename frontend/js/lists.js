const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId');
const shoppingListsContainer = document.getElementById('shoppingListsContainer');

async function fetchComToken(url, options = {}) {
    const token = sessionStorage.getItem('token'); // ou sessionStorage, se preferir
    if (!options.headers) {
        options.headers = {};
    }
    // Adiciona o token se estiver disponível
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, options);
    // Se não autorizado, redireciona
    if (response.status === 401) {
        window.location.href = '/index.html'; // ou a rota de login
        return Promise.reject(new Error('Não autorizado. Redirecionando...'));
    }
    return response;
}

if (!groupId) {
    // Implementar buscar por ID de usuário todas as listas
} else {
    fetchLists();

    async function fetchLists() {
        const response = await fetchComToken(`http://localhost:3000/api/groups/${groupId}/lists`)
        const data = await response.json();
        // Obtém as listas
        const lists = data.data;

        shoppingListsContainer.innerHTML = '';

        if (lists.length === 0) {
            shoppingListsContainer.textContent = 'Nenhuma lista de compras encontrada.';
            return;
        }
        lists.forEach(list => {
            const listDiv = document.createElement('div');
            listDiv.classList.add('shopping-list');

            // Clique leva para os produtos da lista
            listDiv.addEventListener('click', () => {
                window.location.href = `/products.html?listId=${list.id}`;
            });

            listDiv.innerHTML = `
                        <strong>${list.list_name}</strong><br>
                        <small>${new Date(list.created_at).toLocaleDateString()}</small>
                        <p>${list.description || ''}</p>
                        <div class="actions">
                            <button onclick="event.stopPropagation(); editList(${list.list_id})">Editar</button>
                            <button onclick="event.stopPropagation(); deleteList(${list.list_id})">Excluir</button>
                        </div>
                    `;
            shoppingListsContainer.appendChild(listDiv);
        });
    }

    // Adicionar nova lista
    document.getElementById('addListForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('listName').value;
        const description = document.getElementById('listDescription').value;

        fetch(`/api/groups/${groupId}/shopping_lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao criar lista.');
                return response.json();
            })
            .then(() => {
                fetchLists();
                e.target.reset();
            })
            .catch(error => alert(error.message));
    });
}

function editList(listId) {
    const newName = prompt('Novo nome da lista:');
    const newDescription = prompt('Nova descrição (opcional):');
    if (!newName) return;

    fetch(`/api/shopping_lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDescription })
    })
        .then(() => fetchLists())
        .catch(error => alert('Erro ao editar lista: ' + error.message));
}

function deleteList(listId) {
    if (!confirm('Deseja realmente excluir esta lista?')) return;

    fetch(`/api/shopping_lists/${listId}`, {
        method: 'DELETE'
    })
        .then(() => fetchLists())
        .catch(error => alert('Erro ao excluir lista: ' + error.message));
}