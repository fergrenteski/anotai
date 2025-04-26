// Redireciona o usuário para a tela de login
const redirecionarParaLogin = () => {
  window.location.href = "index.html";
};

// Verifica se existe um token válido na sessão
const verificarLogin = async () => {
  const token = sessionStorage.getItem("token");
  // Se não houver token, redireciona para login
  if (!token) return redirecionarParaLogin();

  try {
    // Chama a API para validar o token
    const response = await fetch("http://localhost:3000/api/user/verificar-token", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    // Se a API indicar falha, remove token e redireciona
    if (!data.success) {
      sessionStorage.removeItem("token");
      redirecionarParaLogin();
    }
    // Exibe o nome do usuário na interface
    document.getElementById("nomeUsuario").innerText = data.user?.name || "User";
  } catch {
    // Em caso de erro na requisição, limpa sessão e redireciona
    sessionStorage.removeItem("token");
    redirecionarParaLogin();
  }
};

// Remove o token e redireciona para login
const logout = () => {
  sessionStorage.removeItem("token");
  redirecionarParaLogin();
};

// Executa a verificação de login ao carregar a página
verificarLogin();
