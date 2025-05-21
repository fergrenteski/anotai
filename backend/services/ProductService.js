// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

// Service para gerenciar operações relacionadas a produtos de uma lista.
class ProductService {

    async create(name, description, categoryId, addedBy, listId){
        return runQuery("insert_products", [name, description, categoryId, addedBy, listId])
    }

    async getAll(listId) {
        return runQuery("select_products_by_id", [listId])
    }

    async delete(productId, listId) {
        return runQuery("delete_products_by_id", [productId])
    }
}
// Exporta a classe ProductService
module.exports = ProductService;
