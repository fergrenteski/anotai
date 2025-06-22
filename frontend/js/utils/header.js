import { authFetch } from "./authFetch.js";
import {confirmModal} from "./confirmModal.js";
import {notificar} from "./notification.js";

export async function renderNotifications() {

    const notifications = await loadNotifications();
    const notificationList = document.getElementById('notificationList');
    notificationList.style.display = 'block';

    // Header
    let header = notificationList.querySelector('.notification-header');
    if (!header) {
        header = document.createElement('div');
        header.className = 'notification-header';
        header.style.display = 'flex';
        header.style.justifyContent = 'center';
        header.style.alignItems = 'center';
        header.style.gap = '10px';

        const title = document.createElement('h3');
        title.textContent = 'Notificações';
        title.style.color = 'black';

        header.appendChild(title);
        notificationList.appendChild(header);
    }

    // Items container
    let itemsContainer = notificationList.querySelector('.notification-items');
    if (!itemsContainer) {
        itemsContainer = document.createElement('div');
        itemsContainer.className = 'notification-items';
        notificationList.appendChild(itemsContainer);
    }
    itemsContainer.innerHTML = '';

    if (notifications.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'notification-item empty';
        empty.textContent = 'Sem notificações';
        itemsContainer.appendChild(empty);
        return;
    }

    notifications.forEach((notification) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'notification-wrapper';

        const deleteBackdrop = document.createElement('div');
        deleteBackdrop.className = 'delete-backdrop';
        deleteBackdrop.textContent = 'Excluir';

        const readBackdrop = document.createElement('div');
        readBackdrop.className = 'read-backdrop';
        readBackdrop.textContent = notification.is_read ? 'Não lida' : 'Lida';
        readBackdrop.style.color = notification.is_read ? '#adaa12' : '#3889c5';
        readBackdrop.style.background = notification.is_read ? '#ffffe6' : '#ddeeff';

        wrapper.appendChild(readBackdrop);
        wrapper.appendChild(deleteBackdrop);

        const item = document.createElement('div');
        item.className = 'notification-item';
        if (!notification.is_read) item.classList.add('unread');

        const message = document.createElement('div');
        message.className = 'notification-message';
        message.textContent = notification.name;

        const type = document.createElement('div');
        type.className = 'notification-type';
        type.textContent = notification.message;

        item.appendChild(message);
        item.appendChild(type);
        wrapper.appendChild(item);

        // Swipe detection variables
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        const maxSwipe = 90; // Limite máximo de arrasto

        const handleGestureEnd = () => {
            const minSwipeThreshold = 30;
            const dx = currentX - startX;

            if (Math.abs(dx) < minSwipeThreshold) {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(0)';
                isDragging = false;
                renderNotifications();
                return;
            }

            // Excluir notificação
            if (dx < -100) {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(-40%)';
                setTimeout(async () => {
                    await deleteNotification(notification.id);
                }, 200);
            // Ler/Desler Notificação
            } else if (dx > 100) {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(40%)';
                setTimeout(async () => {
                    await markReadUnreadNotification(notification.id);
                }, 200);
            // Voltar
            } else {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(0)';
                renderNotifications();
            }
            isDragging = false;
        };

        const setupSwipeEvents = (element, container) => {
            element.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // só botão esquerdo
                startX = e.pageX;
                currentX = startX;
                isDragging = true;
                e.preventDefault();
            });

            element.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const rect = container.getBoundingClientRect();
                if (
                    e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top || e.clientY > rect.bottom
                ) {
                    handleGestureEnd();
                    return;
                }

                currentX = e.pageX;
                const dx = currentX - startX;
                const limitedDx = Math.max(-maxSwipe, Math.min(dx, maxSwipe));
                item.style.transform = `translateX(${limitedDx}px)`;
            });

            element.addEventListener('mouseup', handleGestureEnd);
            element.addEventListener('mouseleave', () => {
                if (isDragging) handleGestureEnd();
            });

            // Touch events
            element.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) renderNotifications();
                startX = e.touches[0].clientX;
                currentX = startX;
                isDragging = true;
                e.preventDefault();
            });

            element.addEventListener('touchmove', (e) => {
                if (!isDragging) renderNotifications();

                const rect = container.getBoundingClientRect();
                const touch = e.touches[0];
                if (
                    touch.clientX < rect.left || touch.clientX > rect.right ||
                    touch.clientY < rect.top || touch.clientY > rect.bottom
                ) {
                    handleGestureEnd();
                    renderNotifications();
                }

                currentX = touch.clientX;
                const dx = currentX - startX;
                const limitedDx = Math.max(-maxSwipe, Math.min(dx, maxSwipe));
                item.style.transform = `translateX(${limitedDx}px)`;
            });

            element.addEventListener('touchend', handleGestureEnd);
            element.addEventListener('touchcancel', () => {
                if (isDragging) handleGestureEnd();
            });
        };

        setupSwipeEvents(item, itemsContainer);

        itemsContainer.appendChild(wrapper);
    });

    // Footer
    let footer = notificationList.querySelector('.notification-footer');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'notification-footer';

        const markAllReadBtn = document.createElement('button');
        markAllReadBtn.textContent = 'Marcar todas como lidas';
        markAllReadBtn.onclick = async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await markAllReadNotifications();
        };

        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.textContent = 'Excluir todas';
        deleteAllBtn.onclick = async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await deleteAllNotifications();
        };

        footer.appendChild(markAllReadBtn);
        footer.appendChild(deleteAllBtn);
        notificationList.appendChild(footer);
    }
}

function createHeader() {
    const header = document.createElement('div');
    header.className = 'header';

    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.id = 'logo';
    logo.textContent = 'Anota-ai';
    header.appendChild(logo);

    const nav = document.createElement('nav');

    const linkGroups = document.createElement('a');
    linkGroups.href = 'groups.html';
    linkGroups.textContent = 'GRUPOS';
    nav.appendChild(linkGroups);

    const linkLists = document.createElement('a');
    linkLists.href = '#';
    linkLists.id = 'list-link';
    linkLists.textContent = 'LISTAS';
    nav.appendChild(linkLists);

    header.appendChild(nav);

    const userArea = document.createElement('div');
    userArea.className = 'user-area';
    userArea.id = 'userArea';

    const notificationIcon = document.createElement('div');
    notificationIcon.className = 'notification-icon';
    notificationIcon.id = 'notification-icon';
    notificationIcon.innerHTML = `<i class="fa-solid fa-bell"></i>`;

    const notificationList = document.createElement('div');
    notificationList.className = 'notification-list';
    notificationList.id = 'notificationList';
    notificationList.style.display = 'none';
    notificationIcon.appendChild(notificationList);

    const badge = document.createElement('div');
    badge.className = 'notification-badge';
    badge.id = 'badge';
    badge.style.display = 'none';
    notificationIcon.appendChild(badge);

    notificationIcon.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isVisible = notificationList.style.display === 'block';
        if (isVisible) {
            notificationList.style.display = 'none';
        } else {
            try {
                await renderNotifications();
            } catch (err) {
                console.error('Erro ao buscar notificações', err);
            }
        }
    });

    userArea.appendChild(notificationIcon);

    const userIcon = document.createElement('div');
    userIcon.className = 'user-icon';
    userIcon.id = 'userInitials';
    userArea.appendChild(userIcon);

    const userName = document.createElement('span');
    userName.id = 'userName';
    userName.textContent = 'Usuário';
    userArea.appendChild(userName);

    header.appendChild(userArea);
    return header;
}

async function deleteNotification(id) {
    await authFetch(`http://localhost:3000/api/notification/${id}`,
    {method: 'DELETE'});
    await renderNotifications();
}

async function markReadUnreadNotification(id) {
    await authFetch(`http://localhost:3000/api/notification/${id}`,
        {method: 'PUT'});
    await renderNotifications();
}

async function deleteAllNotifications() {
    confirmModal("Tem certeza que deseja excluir todas as notificações?").then(async (resposta) => {
        if(resposta) {
            await authFetch(`http://localhost:3000/api/notification/`,
                {method: 'DELETE'}).then(data => {
                notificar(data.message);
            }).catch(() => {
                // Nada aqui. Silencia completamente.
            });
            await renderNotifications();
        }
    })
}

async function markAllReadNotifications() {
    confirmModal("Tem certeza que deseja marcar todas as notificações como lidas?").then(async (resposta) => {
        if(resposta) {
            await authFetch(`http://localhost:3000/api/notification/`,
                {method: 'PUT'}).then(data => {
                notificar(data.message);
            }).catch(() => {
                // Nada aqui. Silencia completamente.
            });
            await renderNotifications();
        }
    })
}

async function loadNotifications() {
    const data = await authFetch('http://localhost:3000/api/notification');
    const notifications = data.data;

    const badge = document.getElementById('badge');
    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.textContent = unreadCount;
    } else {
        badge.style.display = 'none';
        badge.textContent = 0;
    }

    return notifications;
}

const container = document.getElementById('header-container');
container.appendChild(createHeader());
