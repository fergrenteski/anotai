// Importa bibliotecas e funçöes:
const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

// Service para gerenciar operações relacionadas a listas de um grupo.

class ListService {

    /**
     * Funcão que retorna a lista a partir do ID do grupo
     * @param {int} groupId Identificador do grupo
     * @returns Lista de Grupos
     */
    async getAllListsByGroupId(groupId) {

        // Carrega todas as queries SQL definidas na aplicação
        const queries = await loadQueries();

         // Executa a query select_list_by_group_id passando o parâmetro groupId e obtém linhas
        const { rows } = await pool.query(queries.select_list_by_group_id, [groupId]);
        return { rows }; // Retorna o objeto com o resultado das linhas
    }
}
// Exporta a classe ListService
module.exports = ListService;
