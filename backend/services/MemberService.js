// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

class MemberService {

    // Busca todas os membros.
    async getAll(groupId) {
        // Executa a consulta SQL.
        return await runQuery("select_members_by_group_id", [groupId]);
    }

    // Busca o Invite
    async getUserInviteToken(invite) {
        // Executa a consulta SQL.
        return await runQuery("select_invite_by_token", [invite]);
    }

    async getUserGroupsByBoth(userId, groupId) {
        const { rows } = await runQuery("select_user_groups", [userId, groupId])
        return rows[0];
    }

    // Cria o invite
    async createUserInviteToken(userId, groupId, email, emailToken, expiresAt) {
        // Executa a consulta SQL.
        return await runQuery("insert_invite_token", [userId, groupId, email, emailToken, expiresAt]);
    }

    async getAllinvites(userId) {
        return await runQuery("select_invites_by_user_id", [userId]);
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

    async deleteGroup(groupId) {
        // Executa a query de atualização do groupId
        return runQuery("expire_user_groups", [groupId]);
    }

    /**
     * Expira logicamente a associação de um usuário a um grupo.
     * @param {number} userId - ID do usuário a expirar a associação.
     * @param {number} groupId - ID do grupo a expirar a associação.
     * @returns {Promise<Object>} Retorna o resultado da expiração.
     */
    async delete(userId, groupId) {
        // Executa a query de atualização do groupId
        return runQuery("expire_user_groups_member", [userId, groupId]);
    }

    async deleteInvite(userId, groupId) {
        // Executa a query de atualização do groupId
        return runQuery("delete_invite_token_by_user_id", [userId, groupId]);
    }
}
// Exporta a classe MemberService
module.exports = MemberService;
