import {renderNotifications} from "./header.js";

export function initNotifications(userId) {
    if (!userId) return;

    const socket = new WebSocket(`ws://localhost:3000?userId=${userId}`);

    socket.onopen = () => {
        console.log("🔌 WebSocket conectado");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data) {
            showNotificationBadge(data);
        }
    };

    function showNotificationBadge(data) {
        const badge = document.getElementById('badge');
        if (!badge) return;

        let unreadCount = 0;

        if (Array.isArray(data.rows)) {
            unreadCount = data.rows.filter(n => !n.is_read).length;
        } else if (data && typeof data === 'object' && data.hasOwnProperty('is_read')) {
            if (!data.is_read) unreadCount = parseInt(badge.textContent) + 1;
        }

        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
            badge.classList.add('badge-pulse');
            setTimeout(() => badge.classList.remove('badge-pulse'), 500);
        } else {
            badge.style.display = 'none';
        }

        const notificationList = document.getElementById("notificationList");
        if(notificationList.style.display === "block") {
            renderNotifications()
        }
    }

    socket.onclose = () => {
        console.log("🔌 WebSocket desconectado");
    };

    socket.onerror = (err) => {
        console.error("WebSocket error", err);
    };
}
