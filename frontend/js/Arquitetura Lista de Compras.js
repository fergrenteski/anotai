```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Dados do usuário (simulando dados que viriam da API)
    const userData = {
        nome: "Arthur Bertoni",
        email: "arthur@exemplo.com"
    };

    // Atualiza dados do usuário na interface
    document.getElementById('userName').textContent = userData.nome;
    
    // Define as iniciais do usuário para o ícone
    const iniciais = userData.nome.split(' ').map(n => n[0]).join('');
    document.getElementById('userInitials').textContent = iniciais;

    // Seletores de elementos
    const itemInput = document.getElementById('itemInput');
    const addItemBtn = document.getElementById('addItemBtn');
    const todoList = document.getElementById('todoList');
    const completedList = document.getElementById('completedList');
    const totalItemsElement = document.getElementById('totalItems');
    const pendingItemsElement = document.getElementById('pendingItems');
    const completedItemsElement = document.getElementById('completedItems');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const categoriesContainer = document.getElementById('categories');

    // Estado da aplicação
    let shoppingItems = JSON.parse(localStorage.getItem('shoppingItems')) || [];
    let activeCategory = 'all';

    // Inicialização
    renderLists();
    updateSummary();

    // Event Listeners
    addItemBtn.addEventListener('click', addItem);
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem();
    });

    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);

    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-item')) {
            document.querySelectorAll('.category-item').forEach(item => {
                item.classList.remove('active');
            });
            e.target.classList.add('active');
            activeCategory = e.target.getAttribute('data-category');
            renderLists();
        }
    });

    document.getElementById('userArea').addEventListener('click', () => {
        alert('Funcionalidade de perfil será implementada em breve!');
    });

    document.querySelector('.back-link').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Redirecionamento para a página principal será implementado em breve!');
    });

    // Funções
    function addItem() {
        const text = itemInput.value.trim();
        if (text) {
            const category = guessCategory(text);
            const newItem = {
                id: Date.now(),
                text,
                completed: false,
                category,
                createdAt: new Date()
            };

            shoppingItems.push(newItem);
            saveItems();
            renderLists();
            updateSummary();
            itemInput.value = '';
            itemInput.focus();
        }
    }

    function guessCategory(text) {
        text = text.toLowerCase();
        
        const categories = {
            'Frutas': ['maçã', 'banana', 'laranja', 'uva', 'pera', 'abacaxi', 'limão', 'manga', 'morango', 'melancia'],
            'Legumes': ['cenoura', 'batata', 'alface', 'tomate', 'cebola', 'alho', 'pepino', 'abobrinha', 'brócolis', 'couve'],
            'Carnes': ['frango', 'bife', 'carne', 'costela', 'linguiça', 'bacon', 'salsicha', 'presunto', 'peito', 'picanha'],
            'Laticínios': ['leite', 'queijo', 'manteiga', 'iogurte', 'requeijão', 'creme', 'nata', 'coalhada', 'ricota']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return category;
            }
        }

        return 'Outros';
    }

    function toggleItem(id) {
        shoppingItems = shoppingItems.map(item => {
            if (item.id === id) {
                return { ...item, completed: !item.completed };
            }
            return item;
        });
        
        saveItems();
        renderLists();
        updateSummary();
    }

    function deleteItem(id) {
        shoppingItems = shoppingItems.filter(item => item.id !== id);
        saveItems();
        renderLists();
        updateSummary();
    }

    function clearCompleted() {
        shoppingItems = shoppingItems.filter(item => !item.completed);
        saveItems();
        renderLists();
        updateSummary();
    }

    function clearAll() {
        if (confirm('Tem certeza que deseja remover todos os itens?')) {
            shoppingItems = [];
            saveItems();
            renderLists();
            updateSummary();
        }
    }

    function saveItems() {
        localStorage.setItem('shoppingItems', JSON.stringify(shoppingItems));
    }

    function renderLists() {
        todoList.innerHTML = '';
        completedList.innerHTML = '';

        const filteredItems = activeCategory === 'all' 
            ? shoppingItems 
            : shoppingItems.filter(item => item.category === activeCategory);

        filteredItems.forEach(item => {
            const listItem = document.createElement('li');
            
            // Criar os elementos sem usar innerHTML e onclick
            const itemTextDiv = document.createElement('div');
            itemTextDiv.className = `item-text ${item.completed ? 'completed' : ''}`;
            
            const categoryLabel = document.createElement('small');
            categoryLabel.textContent = `[${item.category || 'Outros'}]`;
            
            const textSpan = document.createElement('span');
            textSpan.textContent = item.text;
            
            itemTextDiv.appendChild(categoryLabel);
            itemTextDiv.appendChild(textSpan);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            
            const checkButton = document.createElement('button');
            checkButton.className = 'btn-icon btn-check';
            checkButton.textContent = item.completed ? '↩️' : '✅';
            checkButton.addEventListener('click', () => toggleItem(item.id));
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-icon btn-delete';
            deleteButton.textContent = '🗑️';
            deleteButton.addEventListener('click', () => deleteItem(item.id));
            
            actionsDiv.appendChild(checkButton);
            actionsDiv.appendChild(deleteButton);
            
            listItem.appendChild(itemTextDiv);
            listItem.appendChild(actionsDiv);

            if (item.completed) {
                completedList.appendChild(listItem);
            } else {
                todoList.appendChild(listItem);
            }
        });
    }

    function updateSummary() {
        const total = shoppingItems.length;
        const pending = shoppingItems.filter(item => !item.completed).length;
        const completed = shoppingItems.filter(item => item.completed).length;

        totalItemsElement.textContent = total;
        pendingItemsElement.textContent = pending;
        completedItemsElement.textContent = completed;
    }
});
```
