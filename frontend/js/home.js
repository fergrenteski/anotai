// Função para redirecionar para a tela de login
const redirecionarParaLogin = () => {
  window.location.href = "index.html";
};

// Verificar login
const verificarLogin = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return redirecionarParaLogin();

  try {
    const response = await fetch("http://localhost:3000/api/user/verificar-token", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
      sessionStorage.removeItem("token");
    }

    const data = await response.json();

    document.getElementById("nomeUsuario").innerText = data.user?.name || 'User';

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
