// Importa bibliotecas e funçöes:
const ListService = require("../services/ListService");

class ListController {
    constructor() {
        this.listService = new ListService();
    }

    /**
     * Retorna todos os grupos associados ao usuário autenticado.
     * @param {import("express").Request} req - Requisição HTTP com token JWT decodificado (req.usuario).
     * @param {import("express").Response} res - Resposta HTTP.
     * @returns {Promise<e.Response<any, Record<string, any>>>}
     */
    async getAll(req, res) {
        try {

            // Obtém o ID do grupo da URL
            const groupId = req.params.groupId;

            // Chama o buscar todas as listas referente ao ID do grupo.
            const data = await this.listService.getAllListsByGroupId(groupId);
            return res.status(200).json({ success: true,data: data.rows });

        } catch (error) {
            console.error("Erro na Busca de Listas:", error);
            return res.status(500).json({message: error.message});
        }
    }
}
//exporta o ListController
module.exports = new ListController();
