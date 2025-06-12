import {authFetch} from "./utils/authFetch.js";
import {loadUserProfile} from "./utils/loadUserProfile.js";
import {initNotifications} from "./utils/notificationsWS.js";
// Variáveis
let appState = null;
let user = JSON.parse(sessionStorage.getItem('user'));

async function initializeAppState(currentView, user) {
    await verificarLogin();
    appState = {
        currentView: currentView,
    };
}

async function verificarLogin() {
    await authFetch("http://localhost:3000/api/user/verificar-token");

}

// Elemento raiz da aplicação
const appElement = document.getElementById('app');

// Função principal para renderizar a interface
function renderApp() {
    // Limpa o conteúdo atual
    appElement.innerHTML = '';
    renderHome();
}

// Renderizar a lista de grupos
function renderHome() {

    appElement.style.textAlign = 'center';

    // Título da página
    const titulo = document.createElement('h1');
    titulo.textContent = 'Bem vindo!';
    titulo.style.marginBottom = '20px';
    appElement.appendChild(titulo);

    const paragraph = document.createElement('div');
    paragraph.style.width = '500px'
    paragraph.style.margin = "0 auto"
    paragraph.style.textAlign = 'center';
    paragraph.innerHTML = `
      <p>Com nosso aplicativo, você pode criar grupos personalizados para cada ocasião — seja sua casa, viagem, evento ou equipe de trabalho. Compartilhe listas de compras com amigos, familiares ou colegas e mantenham tudo atualizado em tempo real.</p>
      <br>
      <ul>
        <li>🛒 Crie listas de compras fáceis e práticas</li>
        <li>👥 Adicione membros aos seus grupos para colaborar</li>
        <li>✅ Marque itens como comprados e mantenha todos informados</li>
        <li>🔄 Sincronização automática entre os membros</li>
      </ul>
      <br>
      <p>Torne o planejamento das compras mais eficiente, transparente e sem retrabalho.</p>
    `;
    appElement.appendChild(paragraph);
}

async function startApp(currentView = "home") {
    await initializeAppState(currentView);
    renderApp();
}

document.addEventListener('DOMContentLoaded', async () => {
    await startApp(); // Chama o start
});

await loadUserProfile();
if (user && user.userId) {
    initNotifications(user.userId, authFetch);
}