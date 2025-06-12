// notifications.js
export let notifications = [];
let socket = null;
let user = null;

export function initNotifications(userId, authFetch) {
    if (!userId) return;

    let count = 0;

    socket = new WebSocket(`ws://localhost:3000?userId=${userId}`);


    socket.onopen = () => {
        console.log("🔌 WebSocket conectado");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data) {
            showNotificationToast(data.message, data.type);
        }
    };

    function showNotificationToast(message, typeName) {
        const badge = document.getElementById('badge');
        badge.style.display = 'block';
    }

    socket.onclose = () => {
        console.log("🔌 WebSocket desconectado");
    };

    socket.onerror = (err) => {
        console.error("WebSocket error", err);
    };

}
