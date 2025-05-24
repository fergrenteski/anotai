// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

class CategoryService {

    // Categoria de Grupos
    async getGroupsCategories() {
        return runQuery("select_groups_categories");
    }

    // Categoria de Lista
    async getListsCategories() {
        return runQuery("select_lists_categories");
    }

    // Categoria de Produto
    async getProductsCategories() {
        return runQuery("select_products_categories");
    }
}
// Exporta a classe CategoryService
module.exports = CategoryService;
