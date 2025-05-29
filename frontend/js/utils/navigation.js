import {notificar} from "./notification.js";

function abrirPerfil() {
    window.location.href = 'profile.html';
}

function abrirListas() {
    notificar("Listas de usuário será implementada em breve!");
}

function abrirHome() {
    window.location.href = 'home.html';
}

function logout() {
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    notificar("Saindo...").then(() => {
        window.location.href = 'index.html';
    });
}


// Eventos de clique em elementos fixos da interface
document.getElementById("logo").addEventListener('click', abrirHome);
document.getElementById('list-link').addEventListener('click', abrirListas);
document.getElementById('logout').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    logout();
});
document.getElementById('userArea').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    abrirPerfil();
});
