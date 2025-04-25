// Importa pool de conexão ao banco e utilitário de carregamento de queries
const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

//Service para gerenciar associação de usuários a grupos.

class MemberService {

    /**
     * Cria um novo membro em um grupo.
     * @param {number} userId - ID do usuário.
     * @param {number} groupId - ID do grupo.
     * @param {boolean} [verified=false] - Indica se a associação já está verificada.
     * @returns {Promise<Object>} Retorna o resultado da inserção.
     */

    async create(userId, groupId, verified = false) {

        // Carrega as queries definidas na aplicação
        const queries = await loadQueries();

        // Executa inserção em tabela de relação usuário-grupo
        const { rows } = await pool.query(queries.insert_user_groups, [userId, groupId, verified]);
        return { rows };
    }

      /**
     * Expira logicamente a associação de um usuário a um grupo.
     * @param {number} groupId - ID do grupo a expirar a associação.
     * @returns {Promise<Object>} Retorna o resultado da expiração.
     */

    async delete(groupId) {

        // Carrega as queries definidas na aplicação
        const queries = await loadQueries();

        // Executa atualização lógica (expire_user_groups) para o groupId
        const { rows } = await pool.query(queries.expire_user_groups, [groupId]);
        return { rows };
    }

}
// Exporta a classe MemberService
module.exports = MemberService;
