// Importa bibliotecas e funçöes:
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const GroupController = require("../services/CategoryService");

class MemberController {
    constructor() {
        this.userService = new UserService();
        this.memberService = new MemberService();
    }

    /**
     * Método assíncrono que retorna todos os membros de um grupo
     * @param req - Objeto de requisição HTTP.
     * @param res - Objeto de resposta HTTP.
     * @returns {Promise<*>} - Retorna uma resposta JSON com os membros ou erro.
     */
    async getAll(req, res) {
        const groupId = parseInt(req.params.groupId);
        try {

            // Obtem os membros.
            const { rows } = await this.memberService.getAll(groupId);

            //Retorna os dados das categorias
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Membros: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
// Exporta o MemberController
module.exports = new MemberController();
