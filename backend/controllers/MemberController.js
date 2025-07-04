// Importa bibliotecas e funçöes:
const MemberService = require("../services/MemberService");
const UserService = require("../services/UserService");
const {gerarTokenEmail} = require("../utils/validators");
const {runQuery} = require("../utils/queryHelper");
const EmailService = require("../services/EmailService");
const GroupService = require("../services/GroupService");
const NotificationService = require("../services/NotificationService");

class MemberController {
    constructor() {
        this.userService = new UserService();
        this.memberService = new MemberService();
        this.emailService = new EmailService();
        this.groupService = new GroupService();
        this.notificationService = new NotificationService();
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

    async getAllinvites(req, res) {
        const userId = req.usuario.id;
        try {
            const { rows } = await this.memberService.getAllinvites(userId);
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Convites: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }

    }

    async create(req, res) {
        const groupId = parseInt(req.params.groupId);
        const email = req.body.email;
        let userId = null;
        const user = req.usuario;
        try{
            const rows = await this.userService.getUserByEmail(email);
            // Verificação se o usuário existe
            if (!rows) return res.status(400).json({ success: false, message:"Usuário não encontrado" });
            // Obtém o ID de usuário
            userId = rows.user_id;
            // Verifica se ja possui convite.
            const hasInviteRow = await this.memberService.getUserGroupsByBoth(userId, groupId);
            // Membro ja convidado
            if (hasInviteRow) return res.status(400).json({ success: false, message: "Usuário já está no grupo" });
            // Insere a relação de membro do usuário
            await this.memberService.create(parseInt(userId), groupId);
            // Pega os grupos
            const { rows: groups } = await this.groupService.getById(groupId);
            // Obtém somente o primeiro
            const group = groups[0];
            // Gera um token de email
            const { emailToken, expiresAt } = gerarTokenEmail();
            // Insere na tabela o token de Convite
            await this.memberService.createUserInviteToken(parseInt(userId), groupId, email, emailToken, expiresAt);
            // Envia o email para o usuário
            await this.emailService.enviarConviteEmail(parseInt(userId), groupId, group.group_name, email, emailToken);
            // Cria a notificação para o usuário
            await this.notificationService.create(userId, 2, `Você foi convidado ao grupo ${group.group_name} pelo(a) ${user.name}`)
            // Retorno de sucesso
            return res.status(200).json({ success: true, message: "Membro convidado ao grupo"});
        } catch (error){
            console.error("Erro na criação de Membros: ", error);
            await this.memberService.delete(parseInt(userId), groupId);
            return res.status(500).json({ success: false, message: "Erro no convite do membro" });
        }
    }

    async delete(req, res) {
        const groupId = req.params.groupId;
        const memberId = req.params.memberId;
        const sair = req.params.sair === 'sair';
        const user = req.usuario;

        try {
            // Obtém o grupo
            const { rows } = await this.groupService.getById(groupId);
            const group = rows[0];
            // Deleta relação de grupo e usuário
            await this.memberService.delete(parseInt(memberId), parseInt(groupId));
            // Deleta convite
            if(!sair) await this.memberService.deleteInvite(parseInt(memberId), parseInt(groupId));
            // Notificação de Remover usuário
            if(!sair) await this.notificationService.create(memberId, 1, `Você foi removido do grupo ${group.group_name} pelo(a) ${user.name}`);
            // Notificação para o admin indicando que usuário saiu
            if(sair) {
                const { rows } = await this.userService.getProfile(memberId);
                const member = rows[0];
                await this.notificationService.create(group.user_admin_id, 1, `O usuário ${member.name} saiu do seu grupo ${group.group_name}`);
            }
            return res.status(200).json({ success: true, message: sair ? "Você saiu do grupo" : "Membro removido com sucesso" });
        } catch (error) {
            console.error("Erro ao remover usuário: ", error);
            return res.status(500).json({ success: false, message: sair ? "Erro ao sair do grupo" : "Erro ao remover membro" });
        }
    }

    async invite(req, res) {
        const { groupId: groupIdString, memberId: memberIdString, invite, accept: acceptString } = req.params;

        // Verifica a existencia de todos os valores
        if(!groupIdString || !memberIdString || !invite || !acceptString) return res.status(400).json({ success: false, message: "Erro ao validar Convite" });

        // Converte os valores
        const groupId = parseInt(groupIdString);
        const memberId = parseInt(memberIdString);
        const accept = acceptString === "true";

        try {
            // Busca o convite
            const inviteRow = await this.memberService.getUserInviteToken(invite);
            // Verifica de existe convite
            if (!inviteRow) return res.status(400).json({success: false, message: "Convite Inválido"})
            // Busca o grupo
            const userGroup = await runQuery("select_user_group_member_not_verified", [memberId, groupId]);
            // Verifica a existencia do grupo
            if (!userGroup) return res.status(400).json({success: false, message: "Não existe Grupo para este convite"})
            // Atualiza de acordo com a descisão do usuário
            await runQuery(`${accept ? "update" : "delete"}_user_group_member`, [memberId, groupId]);
            // Deleta os Tokens
            await runQuery("delete_invite_token_by_user_token", [invite]);
            // Busca o grupo
            const { rows } = await this.groupService.getById(groupId);
            const group = rows[0];
            // Busca Usuário
            const { rows: memberRows } = await this.userService.getProfile(memberId);
            const member = memberRows[0];
            // Cria a notificação para o Admin
            await this.notificationService.create(group.user_admin_id, 1, `O usuário ${member.name} ${accept ? "Aceitou" : "Recusou"} seu convite de grupo ${group.group_name}`);
            // Retorna a resposta
            return res.status(200).json({success: true, message: `Convite de grupo ${accept ? "Aceitado" : "Rejeitado"}`})
        } catch (error) {
            console.error("Erro ao invite do membro", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
// Exporta o MemberController
module.exports = new MemberController();
