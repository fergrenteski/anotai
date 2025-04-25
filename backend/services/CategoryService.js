// Importa a função runQuery para executar consultas no banco de dados
const { runQuery } = require("../utils/queryHelper");

class CategoryService {

    // Busca todas as categorias e seus grupos associados no banco de dados.
    async getAll() {
        // Executa a consulta SQL identificada por "select_groups_categories"
        return runQuery("select_groups_categories");
    }
}
// Exporta a classe CategoryService para ser utilizada em outras partes da aplicação
module.exports = CategoryService;
