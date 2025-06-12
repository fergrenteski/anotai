function createHeader() {
    // Cria o container principal
    const header = document.createElement('div');
    header.className = 'header';

    // Logo
    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.id = 'logo';
    logo.textContent = 'Anota-ai';
    header.appendChild(logo);

    // Navegação
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

    // Área do usuário
    const userArea = document.createElement('div');
    userArea.className = 'user-area';
    userArea.id = 'userArea';

    // Ícone de notificação
    const notificationIcon = document.createElement('div');
    notificationIcon.className = 'notification-icon';
    notificationIcon.id = 'notification-icon';
    notificationIcon.innerHTML = `<i class="fa-solid fa-bell"></i>`;

    // Badge de notificação (contador)
    const badge = document.createElement('div');
    badge.className = 'notification-badge';
    badge.id = 'badge';
    badge.style.display = 'none';

    notificationIcon.appendChild(badge);
    userArea.appendChild(notificationIcon);

    // Ícone do usuário
    const userIcon = document.createElement('div');
    userIcon.className = 'user-icon';
    userIcon.id = 'userInitials';
    userArea.appendChild(userIcon);

    // Nome do usuário
    const userName = document.createElement('span');
    userName.id = 'userName';
    userName.textContent = 'Usuário';
    userArea.appendChild(userName);

    header.appendChild(userArea);

    return header;
}

const container = document.getElementById('header-container');
container.appendChild(createHeader());