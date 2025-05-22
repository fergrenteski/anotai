// Importa bibliotecas e funções
const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");

// Service para gerenciar operações relacionadas a listas de um grupo
class ListService {
    
    /**
     * Função que retorna todas as listas a partir do ID do grupo
     * @param {int} groupId Identificador do grupo
     * @returns {Object} Lista de Grupos
     */
    async getAllListsByGroupId(groupId) {
        try {
            // Carrega todas as queries SQL definidas na aplicação
            const queries = await loadQueries();
            
            // Executa a query passando o parâmetro groupId e obtém linhas
            const { rows } = await pool.query(queries.select_list_by_group_id, [groupId]);
            
            return { 
                success: true,
                data: rows,
                message: 'Listas recuperadas com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao buscar listas do grupo',
                error: error.message
            };
        }
    }

    /**
     * Função que retorna uma lista específica pelo ID
     * @param {int} listId Identificador da lista
     * @returns {Object} Lista encontrada
     */
    async getListById(listId) {
        try {
            const queries = await loadQueries();
            const { rows } = await pool.query(queries.select_list_by_id, [listId]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    data: null,
                    message: 'Lista não encontrada'
                };
            }

            return {
                success: true,
                data: rows[0],
                message: 'Lista encontrada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao buscar lista',
                error: error.message
            };
        }
    }

    /**
     * Função para criar uma nova lista
     * @param {Object} listData Dados da lista (name, description, group_id, user_id, etc.)
     * @returns {Object} Lista criada
     */
    async createList(listData) {
        try {
            const queries = await loadQueries();
            const { name, description, group_id, user_id } = listData;
            
            const { rows } = await pool.query(queries.insert_list, [
                name, 
                description, 
                group_id, 
                user_id,
                new Date() // created_at
            ]);

            return {
                success: true,
                data: rows[0],
                message: 'Lista criada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao criar lista',
                error: error.message
            };
        }
    }

    /**
     * Função para atualizar uma lista existente
     * @param {int} listId Identificador da lista
     * @param {Object} updateData Dados para atualizar
     * @returns {Object} Lista atualizada
     */
    async updateList(listId, updateData) {
        try {
            const queries = await loadQueries();
            const { name, description } = updateData;
            
            const { rows } = await pool.query(queries.update_list, [
                name,
                description,
                new Date(), // updated_at
                listId
            ]);

            if (rows.length === 0) {
                return {
                    success: false,
                    data: null,
                    message: 'Lista não encontrada para atualização'
                };
            }

            return {
                success: true,
                data: rows[0],
                message: 'Lista atualizada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao atualizar lista',
                error: error.message
            };
        }
    }

    /**
     * Função para deletar uma lista
     * @param {int} listId Identificador da lista
     * @returns {Object} Resultado da operação
     */
    async deleteList(listId) {
        try {
            const queries = await loadQueries();
            
            // Primeiro verifica se a lista existe
            const { rows: existingList } = await pool.query(queries.select_list_by_id, [listId]);
            
            if (existingList.length === 0) {
                return {
                    success: false,
                    data: null,
                    message: 'Lista não encontrada'
                };
            }

            // Deleta a lista
            await pool.query(queries.delete_list, [listId]);

            return {
                success: true,
                data: null,
                message: 'Lista deletada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao deletar lista',
                error: error.message
            };
        }
    }

    /**
     * Função para obter listas por usuário
     * @param {int} userId Identificador do usuário
     * @returns {Object} Listas do usuário
     */
    async getListsByUserId(userId) {
        try {
            const queries = await loadQueries();
            const { rows } = await pool.query(queries.select_lists_by_user_id, [userId]);
            
            return {
                success: true,
                data: rows,
                message: 'Listas do usuário recuperadas com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao buscar listas do usuário',
                error: error.message
            };
        }
    }

    /**
     * Função para obter estatísticas de uma lista
     * @param {int} listId Identificador da lista
     * @returns {Object} Estatísticas da lista
     */
    async getListStats(listId) {
        try {
            const queries = await loadQueries();
            const { rows } = await pool.query(queries.select_list_stats, [listId]);
            
            return {
                success: true,
                data: rows[0] || { total_items: 0, completed_items: 0, pending_items: 0 },
                message: 'Estatísticas da lista recuperadas com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao buscar estatísticas da lista',
                error: error.message
            };
        }
    }

    /**
     * Função para arquivar/desarquivar uma lista
     * @param {int} listId Identificador da lista
     * @param {boolean} archived Status de arquivamento
     * @returns {Object} Resultado da operação
     */
    async archiveList(listId, archived = true) {
        try {
            const queries = await loadQueries();
            
            const { rows } = await pool.query(queries.update_list_archive_status, [
                archived,
                new Date(), // updated_at
                listId
            ]);

            if (rows.length === 0) {
                return {
                    success: false,
                    data: null,
                    message: 'Lista não encontrada'
                };
            }

            return {
                success: true,
                data: rows[0],
                message: `Lista ${archived ? 'arquivada' : 'desarquivada'} com sucesso`
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                message: 'Erro ao arquivar/desarquivar lista',
                error: error.message
            };
        }
    }
}

// Exporta a classe ListService
 module.exports = ListService;