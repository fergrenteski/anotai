// Importa a função runQuery para executar consultas SQL
const { runQuery } = require("../utils/queryHelper");

// Service para gerenciar operações de CRUD em grupos

class GroupService {

    /**
     * Recupera todos os grupos associados a um usuário.
     * @param {number} userId - ID do usuário.
     * @returns {Promise<Array>} Retorna um array de grupos.
     */

    async getAllGroupsByUserId(userId) {

        // Executa a consulta SQL select_groups_by_user_id com o parâmetro userId
        return runQuery("select_groups_by_user_id", [userId]);
    }

    /**
     * Recupera um grupo específico pelo seu ID.
     * @param {number} groupId - ID do grupo.
     * @returns {Promise<Object>} Retorna objeto do grupo.
     */

    async getById(groupId) {

        // Executa a consulta SQL select_group_by_id com o parâmetro groupId
        return runQuery("select_group_by_id", [groupId]);
    }

     /**
     * Cria um novo grupo no banco de dados.
     * @param {string} name - Nome do grupo.
     * @param {number} category - ID da categoria do grupo.
     * @param {string} description - Descrição do grupo.
     * @param {number} userId - ID do usuário que cria o grupo.
     * @returns {Promise<Object>} Retorna o resultado da inserção.
     */

    async create(name, category, description, userId) {

        // Executa a consulta SQL insert_group com os parâmetros de criação
        return runQuery("insert_group", [name, description, category, userId]);
    }

    /**
     * Atualiza os dados de um grupo existente.
     * @param {string} name - Novo nome do grupo.
     * @param {number} category - Novo ID de categoria.
     * @param {string} description - Nova descrição do grupo.
     * @param {number} groupId - ID do grupo a ser atualizado.
     * @returns {Promise<Object>} Retorna o resultado da atualização.
     */

    async update(name, category, description, groupId) {

        // Executa a consulta SQL update_group com os parâmetros de atualização
        return runQuery("update_group", [name, description, category, groupId]);
    }

    /**
     * Remove logicamente (expira) um grupo.
     * @param {number} groupId - ID do grupo a ser removido.
     * @returns {Promise<Object>} Retorna o resultado do grupo.
     */

    async delete(groupId) {

        // Executa a consulta SQL expire_group com o parâmetro groupId
        return runQuery("expire_group", [groupId]);
    }
}
// Exporta a classe GroupService
module.exports = GroupService;
