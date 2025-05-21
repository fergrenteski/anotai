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

    async getProductsByUserId(listId, userId) {
        return runQuery("select_products_by_user_id", [userId, listId])
    }
}
// Exporta a classe ProductService
module.exports = ProductService;
