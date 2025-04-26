// Importa bibliotecas e funçöes:
const GroupService = require("../services/GroupService");
const MemberService = require("../services/MemberService");

class GroupController {
    constructor() {
        this.groupService = new GroupService();
        this.memberService = new MemberService();
    }

    /**
     * Entendimento geral as classes:
     * @param req - Objeto de requisição HTTP.
     * @param res - Objeto de resposta HTTP.
     * @returns - Retorna erro ou data.
     */


    async getAll(req, res) {
        try {

            // Obtém o ID do usuário autenticado
            const userId = req.usuario.id;

            // Busca os grupos pelo usuário
            const { rows } = await this.groupService.getAllGroupsByUserId(userId);
           
            // Retorna os grupos encontrados.
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Grupos:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getById(req, res) {
      try {

          // Obtém o ID do grupo passado na URL.
          const groupId = req.params.groupId;
          
          //busca no banco
          const { rows } = await this.groupService.getById(groupId);

          //Retorna a primeira linha do banco
          return res.status(200).json({ success: true, data: rows[0] });
      } catch (error) {
          console.error("Erro na Busca do Grupo", error);
          return res.status(500).json({ error: error.message });
      }
    }

    async create(req, res) {

        // Obtem dados da requisição
        const { name, category, description } = req.body;
        const userId = req.usuario.id; // ID do autenticado

        // Validação  do peenchimento dos campos
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

        // Obtem dados da requisição
        const { name, category, description } = req.body;
        const groupId = req.params.groupId;

        // Validação dos dados
        if(!name || !category || !groupId) return res.status(400).json({success: false, message: "Todos os campos são obrigatórios"});
        
        try {

            // Atualiza os dados do grupo.
            const data = await this.groupService.update(name, category, description, groupId);
            return res.status(200).json({ success: true, data: data.rows });

        } catch (error) {
            console.error("Erro ao Atualizar Grupo:", groupId, error);
            return res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {

        // Obtém o ID do grupo passado na URL.
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
// Exporta o GroupController
module.exports = new GroupController();
