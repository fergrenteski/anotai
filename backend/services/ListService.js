const {runQuery} = require("../utils/queryHelper");

// Service para gerenciar operações relacionadas a listas de um grupo.

class ListService {

    /**
     * Funcão que retorna a lista a partir do ID do grupo
     * @param {int} groupId Identificador do grupo
     * @returns Lista de Grupos
     */
    async getAllListsByGroupId(groupId) {
        return runQuery("select_list_by_group_id", [groupId]);
    }

    async getById(listId) {
        return runQuery("select_list_by_id", [listId]);
    }

    async create(name, description, categoryId, createdBy, groupId) {
        return runQuery("insert_list", [name, description, categoryId, createdBy, groupId]);
    }

    async update(name, description, categoryId, listId) {
        return runQuery("update_list_by_id", [listId, name, description, categoryId]);
    }

    async delete(listId) {
        return runQuery("delete_list_by_id", [listId]);
    }

    async updateAdmin(userId, listId) {
        return runQuery("update_list_admin_by_id", [userId, listId]);
    }
}
// Exporta a classe ListService
module.exports = ListService;
