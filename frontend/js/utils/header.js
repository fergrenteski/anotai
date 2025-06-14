import { authFetch } from "./authFetch.js";

function renderNotifications(notifications) {
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
        readBackdrop.textContent = notification.read ? 'Não lida' : 'Lida';
        readBackdrop.style.color = notification.read ? '#adaa12' : '#3889c5';
        readBackdrop.style.background = notification.read ? '#ffffe6' : '#ddeeff';

        wrapper.appendChild(readBackdrop);
        wrapper.appendChild(deleteBackdrop);

        const item = document.createElement('div');
        item.className = 'notification-item';
        if (!notification.read) item.classList.add('unread');

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
            const dx = currentX - startX;

            if (dx < -100) {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(-40%)';
                setTimeout(() => {
                    const index = notifications.indexOf(notification);
                    if (index !== -1) {
                        notifications.splice(index, 1);
                        renderNotifications(notifications);
                    }
                }, 200);
            } else if (dx > 100) {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(40%)';
                setTimeout(() => {
                    notification.read = !notification.read; // Alterna leitura
                    renderNotifications(notifications);
                }, 200);
            } else {
                item.style.transition = 'transform 0.2s ease-out';
                item.style.transform = 'translateX(0)';
            }

            isDragging = false;
        };

        const setupSwipeEvents = (element, container) => {
            element.addEventListener('mousedown', (e) => {
                startX = e.pageX;
                isDragging = true;
                e.preventDefault();
            });

            element.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                // Verifica se o mouse está dentro do container
                const rect = container.getBoundingClientRect();
                if (
                    e.clientX < rect.left || e.clientX > rect.right ||
                    e.clientY < rect.top || e.clientY > rect.bottom
                ) {
                    // Saiu do container, cancela drag
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

            container.addEventListener('mouseleave', () => {
                if (isDragging) handleGestureEnd();
            });

            // Touch events
            element.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                e.preventDefault();
            });

            element.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                const rect = container.getBoundingClientRect();
                const touch = e.touches[0];
                if (
                    touch.clientX < rect.left || touch.clientX > rect.right ||
                    touch.clientY < rect.top || touch.clientY > rect.bottom
                ) {
                    handleGestureEnd();
                    return;
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
        markAllReadBtn.onclick = () => {
            notifications.forEach(n => n.read = true);
            renderNotifications(notifications);
        };

        const deleteAllBtn = document.createElement('button');
        deleteAllBtn.textContent = 'Excluir todas';
        deleteAllBtn.onclick = () => {
            notifications.length = 0;
            renderNotifications(notifications);
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
                const data = await authFetch('http://localhost:3000/api/notification');
                const notifications = data.data;
                renderNotifications(notifications);
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

const container = document.getElementById('header-container');
container.appendChild(createHeader());
