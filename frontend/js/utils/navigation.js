import {modal} from "./modal.js";

function abrirPerfil() {
    modal("Perfil de usuário será implementada em breve!");
}

function abrirListas() {
    modal("Listas de usuário será implementada em breve!");
}

function abrirHome() {
    window.location.href = 'home.html';
}

function logout() {
    sessionStorage.removeItem("token");
    modal("Saindo...");
    window.location.href = 'index.html';
}


// Eventos de clique em elementos fixos da interface
document.getElementById('userName').addEventListener('click', abrirPerfil);
document.getElementById('logo').addEventListener('click', abrirHome);
document.getElementById('list-link').addEventListener('click', abrirListas);
document.getElementById('logout').addEventListener('click', logout);
