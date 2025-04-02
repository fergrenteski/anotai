import API_URLS from "./utils/env.js";

const url = API_URLS.AUTH_URL;

// Função para redirecionar para a tela de login
const redirecionarParaLogin = () => {
  window.location.href = "index.html";
};

// Verificar login
const verificarLogin = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return redirecionarParaLogin();

  try {
    const response = await fetch(`${url}/verificar-token`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!data.success) {
      sessionStorage.removeItem("token");
      return redirecionarParaLogin();
    }

    document.getElementById("nomeUsuario").innerText = data.name;
  } catch {
    sessionStorage.removeItem("token");
    redirecionarParaLogin();
  }
};

// Logout
const logout = () => {
  sessionStorage.removeItem("token");
  redirecionarParaLogin();
};

// Executar verificação de login
verificarLogin();
