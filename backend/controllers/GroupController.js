const UserService = require("../services/UserService");
const EmailService = require("../services/EmailService");
const GroupService = require("../services/GroupService");

class UserController {
    constructor() {
        this.userService = new UserService();
        this.emailService = new EmailService();
        this.groupService = new GroupService();
    }

    /**
     * Retorna todos os grupos associados ao usuário autenticado.
     * @param {import("express").Request} req - Requisição HTTP com token JWT decodificado (req.usuario).
     * @param {import("express").Response} res - Resposta HTTP.
     * @returns {Promise<void>}
     */
    async getAll(req, res) {
        try {
            const userId = req.usuario.id; // <- Aqui está o userId do token!
            const data = await this.groupService.getAllGroupsByUserId(userId);
            return res.status(200).json({ 
                success: true, 
                message: data.message, 
                groups: data.rows 
            });

        } catch (error) {
            console.error("Erro na Busca de Grupos:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Retorna todos os grupos associados ao usuário autenticado.
     * @param {import("express").Request} req - Requisição HTTP com token JWT decodificado (req.usuario).
     * @param {import("express").Response} res - Resposta HTTP.
     * @returns {Promise<void>}
     */
    async getById(req, res) {
      try {
          const groupId = req.params.id; // <- Aqui está o userId do token!
          const data = await this.groupService.getById(groupId);
          return res.status(200).json({ 
              success: true, 
              message: data.message, 
              groups: data.rows[0] 
          });

      } catch (error) {
          console.error("Erro na Busca do Grupo", error);
          return res.status(500).json({ success: false, message: error.message });
      }
  }
}

module.exports = new UserController();
