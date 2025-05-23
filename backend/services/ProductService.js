// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

// Service para gerenciar operações relacionadas a produtos de uma lista.
class ProductService {

    async create(name, description, categoryId, addedBy, quantity, listId){
        return runQuery("insert_products", [name, description, categoryId, addedBy, quantity, listId])
    }

    async getAll(listId) {
        return runQuery("select_products_by_id", [listId])
    }

    async delete(productId) {
        return runQuery("delete_products_by_id", [productId])
    }

    async updateBuy(buyBy,price,productId) {
        return runQuery("update_products_purchased", [buyBy,price,productId])
    }

    //----------------------
    async getProductsByUserId(listId, userId) {
        return runQuery("select_products_by_user_id", [userId, listId])
    }
    async getTotalCategories(listId) {
        return runQuery("select_total_categories_by_list_id", [listId])
    }

    async getTopCategoriesByUsers(listId) {
        return runQuery("select_total_user_categories_by_list_id", [listId])
    }

    async getTotalByUsers(listId) {
        return runQuery("select_total_users_by_list_id", [listId])
    }
}
// Exporta a classe ProductService
module.exports = ProductService;
