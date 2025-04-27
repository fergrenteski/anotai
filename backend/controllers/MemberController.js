// Importa bibliotecas e funçöes:
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");

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

    async create(req, res) {
        const groupId = parseInt(req.params.groupId);
        const email = req.body.email;
        try{
            const rows = await this.userService.getUserByEmail(email);

            if (!rows) return res.status(400).json({ success: false, message:"Usuário não encontrado" });

            const userId = rows.user_id;

            await this.memberService.create(parseInt(userId), groupId, true);

            return res.status(200).json({ success: true, message: "Membro adicionado com sucesso" });
        } catch (error){
            console.error("Erro na criação de Membros: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        const groupId = req.params.groupId;
        const memberId = req.params.memberId;
        try {
            await this.memberService.delete(parseInt(memberId), parseInt(groupId));
            return res.status(200).json({ success: true, message: "Membro removido com sucesso" });
        } catch (error) {
            console.error("Erro ao remover usuário: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
// Exporta o MemberController
module.exports = new MemberController();
