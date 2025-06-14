const WebSocket = require("ws");
const { Client } = require("pg");
const dbConfig = require("./database/config");
const NotificationService = require("./services/NotificationService"); // ajuste para o caminho do seu config de conexão

const clients = new Map();
const notificationService = new NotificationService();

async function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    // Conexão dedicada para LISTEN
    const listenClient = new Client(dbConfig);

    await listenClient.connect();

    await listenClient.query('LISTEN new_notification');

    listenClient.on('notification', (msg) => {
        try {
            const notif = JSON.parse(msg.payload);

            // Convertendo para string para garantir chave correta no Map
            const targetUserId = notif.user_id?.toString();
            const ws = clients.get(targetUserId);

            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    ...notif
                }));
                console.log(`✅ Notificação enviada para o usuário ${targetUserId}`);
            } else {
                console.log(`⚠️ Usuário ${targetUserId} não está conectado via WebSocket.`);
            }
        } catch (err) {
            console.error('❌ Erro ao processar notificação:', err);
        }
    });

    wss.on("connection", async (ws, req) => {
        const params = new URLSearchParams(req.url.split("?")[1]);
        const userId = params.get("userId");

        if (!userId) {
            ws.close();
            return;
        }

        clients.set(userId, ws);
        console.log(`✅ Usuário conectado via WS: ${userId}`);

        const { rows } = await notificationService.getAll(userId);

        if(rows && rows.length > 0) {
            ws.send(JSON.stringify({
                rows
            }));
        }

        ws.on("close", () => {
            clients.delete(userId);
            console.log(`🔌 Usuário desconectado via WS: ${userId}`);
        });

        ws.on("message", (message) => {
            console.log(`📩 Mensagem WS de ${userId}: ${message}`);
        });
    });

    return { clients };
}

module.exports = { setupWebSocket };
