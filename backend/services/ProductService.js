// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

// Service para gerenciar operações relacionadas a produtos de uma lista.
class ProductService {

    async getTotalCategories(listId) {
        return runQuery("select_total_categories_by_list_id", [listId])
    }

    async getTopCategoriesByUsers(listId) {
        return runQuery("select_total_user_categories_by_list_id", [listId])
    }

    async getTotalByUsers(listId) {
        return runQuery("select_total_users_by_list_id", [listId])
    }

    async create(name, description, categoryId, addedBy, listId){
        return runQuery("insert_products", [name, description, categoryId, addedBy, listId])
    }

    async getAll(listId) {
        return runQuery("select_products_by_id", [listId])
    }
}
// Exporta a classe ProductService
module.exports = ProductService;
