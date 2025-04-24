const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

class ListService {

    /**
     * Funcão que retorna a lista a partir do ID do grupo
     * @param {int} groupId Identificador do grupo
     * @returns Lista de Grupos
     */
    async getAllListsByGroupId(groupId) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_list_by_group_id, [groupId]);
        return { rows };
    }
}

module.exports = ListService;
