function abrirPerfil() {
document.getElementById("user-avatar").addEventListener("click", () => {
  window.location.href = "html/profile.html";
});
document.getElementById("user-name").addEventListener("click", () => {
  window.location.href = "html/profile.html";
});
}

function abrirListas() {
    alert("Listas de usuário será implementada em breve!");
    window.location.href = 'lists.html';
}

function abrirHome() {
    window.location.href = 'home.html';
}

function logout() {
    sessionStorage.removeItem("token");
    alert("Saindo...");
    window.location.href = 'index.html';
}


// Eventos de clique em elementos fixos da interface
document.getElementById('userName').addEventListener('click', abrirPerfil);
document.getElementById('logo').addEventListener('click', abrirHome);
document.getElementById('list-link').addEventListener('click', abrirListas);
document.getElementById('logout').addEventListener('click', logout);
