// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

class MemberService {

    // Busca todas os membros.
    async getAll(groupId) {
        // Executa a consulta SQL.
        return await runQuery("select_members_by_group_id", [groupId]);
    }

    /**
     * Cria um novo membro em um grupo.
     */
    async create(userId, groupId, verified = false) {
        // Executa inserção em tabela de relação usuário-grupo
        return runQuery("insert_user_groups", [userId, groupId, verified]);
    }

    /**
     * Expira logicamente a associação de um usuário a um grupo.
     * @param {number} groupId - ID do grupo a expirar a associação.
     * @returns {Promise<Object>} Retorna o resultado da expiração.
     */

    async delete(groupId) {
        // Executa a query de atualização do groupId
        return runQuery("expire_user_groups", [groupId]);
    }
}
// Exporta a classe MemberService
module.exports = MemberService;
