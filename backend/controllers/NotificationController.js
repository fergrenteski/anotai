// Importa bibliotecas e funçöes:
const NotificationService = require("../services/NotificationService");

class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }

    async getAll(req, res) {
        const userId = req.usuario.id;
        try {

            // Obtém as notificações.
            const { rows } = await this.notificationService.getAll(userId);

            //Retorna os dados das notificações
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Notificações: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async markAllAsRead(req, res) {
        const userId = req.usuario.id;
        try {
            await this.notificationService.markAllAsRead(userId);
            return res.status(200).json({ success: true, message: "Todas as notificações foram lidas" });
        } catch (error) {
            console.error("Erro na atualização de Notificações: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async markAsRead(req, res) {
        const notificationId = req.params.id;
        try {
            await this.notificationService.markAsRead(notificationId);
            return res.status(200).json({ success: true, message: "Notificação Lida" });
        } catch (error) {
            console.error("Erro na atualização de Notificações: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteAll(req, res) {
        const userId = req.usuario.id;
        try {
            await this.notificationService.deleteAll(userId);
            return res.status(200).json({ success: true, message: "Todas notificações foram deletadas" });
        } catch (error) {
            console.error("Erro na exclusão de Notificações: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        const notificationId = req.params.id;
        try {
            await this.notificationService.delete(notificationId);
            return res.status(200).json({ success: true, message: "Notificação Deletada" });
        } catch (error) {
            console.error("Erro na exclusão de Notificações: ", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
// Exporta o NotificationController
module.exports = new NotificationController();
