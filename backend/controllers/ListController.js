// Importa bibliotecas e funçöes:
const ListService = require("../services/ListService");

class ListController {
    constructor() {
        this.listService = new ListService();
    }

    async getAll(req, res) {
        try {

            // Obtém o ID do grupo da URL
            const groupId = req.params.groupId;

            // Chama o buscar todas as listas referente ao ID do grupo.
            const { rows } = await this.listService.getAllListsByGroupId(groupId);
            return res.status(200).json({ success: true, data: rows, user: req.usuario });

        } catch (error) {
            console.error("Erro na Busca de Listas:", error);
            return res.status(500).json({success: false, message: "Erro na Busca de Listas"});
        }
    }

    async getById(req, res) {
        try {

            // Obtém o ID da lista da URL
            const listId = req.params.listId;

            // Chama o buscar todas as listas referente ao ID do grupo.
            const { rows } = await this.listService.getById(listId);
            // Verifica se existe lista
            if(rows.length === 0) return res.status(400).json({success: false, message: "Lista não existe!"});

            return res.status(200).json({ success: true, data: rows[0] });
        } catch (error) {
            console.error("Erro na Busca de Listas:", error);
            return res.status(500).json({success: false, message: "Erro na Busca de Listas"});
        }
    }

    async create(req, res) {
        try {

            // Obtém o ID do grupo da URL
            const groupId = req.params.groupId;

            const { name, description, categoryId } = req.body;

            const createdBy = req.usuario.id;

            // Chama o buscar todas as listas referente ao ID do grupo.
            await this.listService.create(name, description, categoryId, createdBy, groupId);
            return res.status(200).json({ success: true, message: "Lista criada com sucesso!"});

        } catch (error) {
            console.error("Erro na criação de Listas:", error);
            return res.status(500).json({success: false, message: "Erro na criação de Listas"});
        }
    }

    async update(req, res) {
        try {

            // Obtém o ID do grupo da URL
            const listId = req.params.listId;

            const { name, description, categoryId } = req.body;

            // Chama o buscar todas as listas referente ao ID do grupo.
            await this.listService.update(name, description, categoryId, listId);
            return res.status(200).json({ success: true, message: "Lista Editada com sucesso!"});

        } catch (error) {
            console.error("Erro na edicão de Listas:", error);
            return res.status(500).json({success: false, message: "Erro na edicão de Listas"});
        }
    }
}
//exporta o ListController
module.exports = new ListController();
