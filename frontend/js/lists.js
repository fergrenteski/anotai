// Lê o parâmetro 'groupId' da URL
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('groupId');

// Referência ao container onde as listas serão exibidas
const shoppingListsContainer = document.getElementById('shoppingListsContainer');

// Função genérica para fazer fetch com token de autenticação
async function fetchComToken(url, options = {}) {
    const token = sessionStorage.getItem('token');
    if (!options.headers) {
        options.headers = {};
    }
    // Adiciona cabeçalho Authorization quando o token existir
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, options);
    // Redireciona para login se não autorizado
    if (response.status === 401) {
        window.location.href = '/index.html';
        return Promise.reject(new Error('Não autorizado. Redirecionando...'));
    }
    return await response.json();
}

// Se não houver groupId, buscar todas as listas do usuário (não implementado ainda)
if (!groupId) {
    // TODO: Implementar busca por listas do usuário
} else {
    // Carrega as listas do grupo ao abrir a página
    fetchLists();

    // Busca e exibe as listas do grupo
    async function fetchLists() {
        const data = await fetchComToken(`http://localhost:3000/api/groups/${groupId}/lists`);
        const lists = data.data; // Obtém o array de listas

        shoppingListsContainer.innerHTML = '';

        if (lists.length === 0) {
            shoppingListsContainer.textContent = 'Nenhuma lista de compras encontrada.';
            return;
        }

        // Cria elementos para cada lista e adiciona na página
        lists.forEach(list => {
            const listDiv = document.createElement('div');
            listDiv.classList.add('shopping-list');

            // Redireciona ao clicar na lista
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

    // Ao submeter o formulário, cria uma nova lista
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
            fetchLists(); // Recarrega as listas
            e.target.reset();
        })
        .catch(error => alert(error.message));
    });
}

// Edita o nome ou descrição de uma lista existente
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

// Remove uma lista após confirmação do usuário
function deleteList(listId) {
    if (!confirm('Deseja realmente excluir esta lista?')) return;

    fetch(`/api/shopping_lists/${listId}`, {
        method: 'DELETE'
    })
    .then(() => fetchLists())
    .catch(error => alert('Erro ao excluir lista: ' + error.message));
}
