// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

class CategoryService {

    // Busca todas as categorias e seus grupos associados no banco de dados.
    async getAll() {
        
        // Executa a consulta SQL identificada por "select_groups_categories"
        return runQuery("select_groups_categories");
    }

    async getAllProducts() {
        return runQuery("select_products_categories");
    }
}
// Exporta a classe CategoryService
module.exports = CategoryService;
