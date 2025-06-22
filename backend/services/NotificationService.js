// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

class NotificationService {

    // Busca todas as notificações
    async getAll(userId) {
        // Executa a consulta SQL.
        return await runQuery("select_notifications_by_user_id", [userId]);
    }

    // Marca a notificação como lida
    async markAsRead(notificationId) {
        // Executa a consulta SQL.
        return await runQuery("update_notification_status_by_id", [notificationId]);
    }

    // Marca as todas notificações como lida
    async markAllAsRead(userId) {
        // Executa a consulta SQL.
        return await runQuery("update_notification_status_by_user_id", [userId]);
    }

    // Deleta a notificação
    async delete(notificationId) {
        // Executa a consulta SQL.
        return await runQuery("delete_notification_by_id", [notificationId]);
    }

    // Deleta todas notificações do usuário
    async deleteAll(userId) {
        // Executa a consulta SQL.
        return await runQuery("delete_notification_by_user_id", [userId]);
    }

    async create(userId, type, message) {
        return await runQuery("create_notification_by_user_id", [userId, type, message]);
    }

}
// Exporta a classe MemberService
module.exports = NotificationService;
