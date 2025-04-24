const GroupService = require("../services/GroupService");
const MemberService = require("../services/MemberService");

class GroupController {
    constructor() {
        this.groupService = new GroupService();
        this.memberService = new MemberService();
    }

    async getAll(req, res) {
        try {
            const userId = req.usuario.id;
            const { rows } = await this.groupService.getAllGroupsByUserId(userId);
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Grupos:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
      try {
          const groupId = req.params.groupId;
          const { rows } = await this.groupService.getById(groupId);
          return res.status(200).json({ success: true, data: rows[0] });
      } catch (error) {
          console.error("Erro na Busca do Grupo", error);
          return res.status(500).json({ error: error.message });
      }
    }

    async create(req, res) {
        const { name, category, description } = req.body;
        const userId = req.usuario.id;
        if(!name || !category) return res.status(400).json({error: "Todos os campos são obrigatórios"});

        try {
            // Cria o grupo
            const { rows } = await this.groupService.create(name, category, description, userId);
            // Obtem o Id do Grupo criado
            const groupId = rows[0].group_id
            // Adiciona na Relação de usuários e grupos
            await this.memberService.create(userId, groupId, true);
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Grupos:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        const { name, category, description } = req.body;
        const groupId = req.params.groupId;
        if(!name || !category || !groupId) return res.status(400).json({success: false, message: "Todos os campos são obrigatórios"});
        try {
            const data = await this.groupService.update(name, category, description, groupId);
            return res.status(200).json({ success: true, data: data.rows });

        } catch (error) {
            console.error("Erro ao Atualizar Grupo:", groupId, error);
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        const groupId = req.params.groupId;
        try {
            // Deleta o grupo
            const { rows } = await this.groupService.delete(groupId);
            // Deleta a relação de usuário e grupos
            await this.memberService.delete(groupId);
            return res.status(200).json({ success: true, data: rows });

        } catch (error) {
            console.error("Erro ao Deletar Grupo:", groupId, error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new GroupController();
