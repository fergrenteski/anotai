const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

class UserService {
    
    /**
     * Funcão que retorna a lista de grupos a partir do ID do usuário
     * @param {int} userId Identificador do Usuário
     * @returns Lista de Grupos
     */
    async getAllGroupsByUserId(userId) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_groups_by_user_id, [userId]);
        return { rows };
    }

    /**
     * Funcão que retorna a lista de grupos a partir do ID do usuário
     * @param {int} userId Identificador do Usuário
     * @returns Lista de Grupos
     */
    async getById(groupId) {
      const queries = await loadQueries();
      const { rows } = await pool.query(queries.select_group_by_id, [groupId]);
      return { rows };
  }
}

module.exports = UserService;
