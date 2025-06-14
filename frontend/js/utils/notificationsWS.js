export function initNotifications(userId) {
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:3000?userId=${userId}`);

    socket.onopen = () => {
        console.log("🔌 WebSocket conectado");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data) {
            showNotificationBadge();
        }
    };

    function showNotificationBadge() {
        const badge = document.getElementById('badge');
        if (!badge) return;

        badge.style.display = 'block';
        badge.classList.add('badge-pulse');
        setTimeout(() => badge.classList.remove('badge-pulse'), 500);
    }

    socket.onclose = () => {
        console.log("🔌 WebSocket desconectado");
    };

    socket.onerror = (err) => {
        console.error("WebSocket error", err);
    };
}
