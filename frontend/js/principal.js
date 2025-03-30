import API_URLS from "./utils/env.js";
const url = API_URLS.AUTH_URL;

async function verificarLogin() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await fetch(`${url}/verificar-token`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Token inválido");
    }

    const data = await response.json();
    document.getElementById("nomeUsuario").innerText = data.nome;
  } catch (error) {
    sessionStorage.removeItem("token");
    window.location.href = "index.html";
  }
}

function logout() {
  sessionStorage.removeItem("token");
  window.location.href = "index.html";
}

verificarLogin();
