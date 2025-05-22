// Importa bibliotecas e funções
const ListService = require("../services/ListService");
import { showToast } from '../utils/toast.js';
import { formatDate } from '../utils/dateUtils.js';
class ListController {
    constructor() {
        this.listService = new ListService();
        this.lists = JSON.parse(localStorage.getItem('shopping_lists') || '[]');
        this.initializeEventListeners();
        this.renderLists();
    } 
    /**
     * Retorna todos os grupos associados ao usuário autenticado.
     * @param {import("express").Request} req - Requisição HTTP com token JWT decodificado (req.usuario).
     * @param {import("express").Response} res - Resposta HTTP.
     * @returns {Promise<e.Response<any, Record<string, any>>>}
     */
    async getAll(req, res) {
        try {
           // Obtém o ID do grupo da URL
            const groupId = req.params.groupId;
        // Chama o buscar todas as listas referente ao ID do grupo.
            const data = await this.listService.getAllListsByGroupId(groupId);
            return res.status(200).json({ success: true, data: data.rows });
        } catch (error) {
            console.error("Erro na Busca de Listas:", error);
            return res.status(500).json({message: error.message});
        }
    }
    initializeEventListeners() {
        // Event listener para o formulário de nova lista
        const addListForm = document.querySelector('.add-list-form');
        if (addListForm) {
            addListForm.addEventListener('submit', (e) => this.handleAddList(e));
        }
        // Event listener para cliques na lista (editar, excluir, visualizar)
        const listsContainer = document.querySelector('.lists-container');
        if (listsContainer) {
            listsContainer.addEventListener('click', (e) => this.handleListClick(e));
        }
        // Event listener para modais
        this.initializeModalEventListeners();
    }
    initializeModalEventListeners() {
        // Modal de edição
        const editModal = document.getElementById('editListModal');
        const editForm = document.getElementById('editListForm');
        const cancelEditBtn = document.getElementById('cancelEdit');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditList(e));
        }
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        }
        // Modal de confirmação de exclusão
        const deleteModal = document.getElementById('deleteListModal');
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        const cancelDeleteBtn = document.getElementById('cancelDelete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDeleteList());
        }
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        // Fechar modais ao clicar fora
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) this.closeEditModal();
            });
        }
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) this.closeDeleteModal();
            });
        }
    }
    handleAddList(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const listName = formData.get('listName')?.trim();
        const listDescription = formData.get('listDescription')?.trim();
        if (!listName) {
            showToast('Nome da lista é obrigatório', 'error');
            return;
        }
        // Verificar se já existe uma lista com o mesmo nome
        if (this.lists.some(list => list.name.toLowerCase() === listName.toLowerCase())) {
            showToast('Já existe uma lista com este nome', 'error');
            return;
        }
        const newList = {
            id: this.generateId(),
            name: listName,
            description: listDescription || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            itemCount: 0
        };
        this.lists.push(newList);
        this.saveLists();
        this.renderLists();
        e.target.reset();
        showToast('Lista criada com sucesso!', 'success');
    }
    handleListClick(e) {
        const listCard = e.target.closest('.list-card');
        if (!listCard) return;
        const listId = listCard.dataset.listId;
        const action = e.target.closest('[data-action]')?.dataset.action;
        switch (action) {
            case 'edit':
                e.preventDefault();
                this.openEditModal(listId);
                break;
            case 'delete':
                e.preventDefault();
                this.openDeleteModal(listId);
                break;
            default:
                // Clique na lista - redirecionar para produtos
                if (!e.target.closest('.list-actions')) {
                    window.location.href = `/produtos.html?listId=${listId}`;
                }
                break;
        }
    }
    openEditModal(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return;
        const modal = document.getElementById('editListModal');
        const nameInput = document.getElementById('editListName');
        const descriptionInput = document.getElementById('editListDescription');
        if (nameInput) nameInput.value = list.name;
        if (descriptionInput) descriptionInput.value = list.description;
        modal.dataset.listId = listId;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    closeEditModal() {
        const modal = document.getElementById('editListModal');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        delete modal.dataset.listId;
    }
    handleEditList(e) {
        e.preventDefault();
        const modal = document.getElementById('editListModal');
        const listId = modal.dataset.listId;
        const formData = new FormData(e.target);
        const listName = formData.get('listName')?.trim();
        const listDescription = formData.get('listDescription')?.trim();
        if (!listName) {
            showToast('Nome da lista é obrigatório', 'error');
            return;
        }
        const listIndex = this.lists.findIndex(l => l.id === listId);
        if (listIndex === -1) return;
        // Verificar se já existe outra lista com o mesmo nome
        const existingList = this.lists.find(list => 
            list.name.toLowerCase() === listName.toLowerCase() && list.id !== listId
        )
        if (existingList) {
            showToast('Já existe uma lista com este nome', 'error');
            return;
        }
        this.lists[listIndex] = {
            ...this.lists[listIndex],
            name: listName,
            description: listDescription || '',
            updatedAt: new Date().toISOString()
        };
        this.saveLists();
        this.renderLists();
        this.closeEditModal();
        showToast('Lista atualizada com sucesso!', 'success');
    }
    openDeleteModal(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return;
        const modal = document.getElementById('deleteListModal');
        const listNameSpan = document.getElementById('deleteListName');
        if (listNameSpan) listNameSpan.textContent = list.name;
        modal.dataset.listId = listId;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    closeDeleteModal() {
        const modal = document.getElementById('deleteListModal');
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        delete modal.dataset.listId;
    }
    confirmDeleteList() {
        const modal = document.getElementById('deleteListModal');
        const listId = modal.dataset.listId;
        const listIndex = this.lists.findIndex(l => l.id === listId);
        if (listIndex === -1) return;
        const listName = this.lists[listIndex].name;
        // Remover a lista
        this.lists.splice(listIndex, 1);
        // Remover produtos associados à lista
        const products = JSON.parse(localStorage.getItem('shopping_products') || '[]');
        const filteredProducts = products.filter(product => product.listId !== listId);
        localStorage.setItem('shopping_products', JSON.stringify(filteredProducts));
        this.saveLists();
        this.renderLists();
        this.closeDeleteModal();
        showToast(`Lista "${listName}" excluída com sucesso!`, 'success');
    }
    renderLists() {
        const container = document.querySelector('.lists-container');
        if (!container) return;
        if (this.lists.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>Nenhuma lista encontrada</h3>
                    <p>Crie sua primeira lista de compras para começar a organizar suas compras.</p>
                </div>
            `;
            return;
        }
        const listsHtml = this.lists
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map(list => this.renderListCard(list))
            .join('');

        container.innerHTML = listsHtml;
    }
    renderListCard(list) {
        const createdDate = formatDate(list.createdAt);
        const updatedDate = list.updatedAt !== list.createdAt ? formatDate(list.updatedAt) : null;
        return `
            <div class="list-card" data-list-id="${list.id}">
                <div class="list-card-header">
                    <h3 class="list-title">${this.escapeHtml(list.name)}</h3>
                    <div class="list-actions">
                        <button class="btn-icon btn-edit" data-action="edit" title="Editar lista">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" data-action="delete" title="Excluir lista">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${list.description ? `<p class="list-description">${this.escapeHtml(list.description)}</p>` : ''}
                <div class="list-stats">
                    <div class="stat">
                        <i class="fas fa-shopping-cart"></i>
                        <span>${list.itemCount || 0} itens</span>
                    </div>
                </div>
                <div class="list-dates">
                    <small class="created-date">Criada em ${createdDate}</small>
                    ${updatedDate ? `<small class="updated-date">Atualizada em ${updatedDate}</small>` : ''}
                </div>
            </div>
        `;
    }
    updateListItemCount(listId) {
        const products = JSON.parse(localStorage.getItem('shopping_products') || '[]');
        const listProducts = products.filter(product => product.listId === listId);
        
        const listIndex = this.lists.findIndex(l => l.id === listId);
        if (listIndex !== -1) {
            this.lists[listIndex].itemCount = listProducts.length;
            this.lists[listIndex].updatedAt = new Date().toISOString();
            this.saveLists();
        }
    }
    getListById(listId) {
        return this.lists.find(list => list.id === listId);
    }
    saveLists() {
        localStorage.setItem('shopping_lists', JSON.stringify(this.lists));
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
// Inicializar o controller quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ListController();
});
// Exporta o ListController
module.exports = new ListController();
export default ListController;