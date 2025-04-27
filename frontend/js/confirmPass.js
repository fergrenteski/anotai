// URL base da API de usuário para operações de redefinição de senha
const url = "http://localhost:3000/api/user";

// Função que faz o POST para alterar a senha
const alterarSenha = async () => {
  // Captura os valores dos inputs
  const novaSenha = document.getElementById("senha").value;
  const confirmarSenha = document.getElementById("confirmarSenha").value;
  const mensagemEl = document.getElementById("mensagem");

  // Valida campos obrigatórios
  if (!novaSenha || !confirmarSenha) {
    mensagemEl.innerText = "Todos os campos são obrigatórios!";
    return;
  }

  // Valida senhas iguais
  if (novaSenha !== confirmarSenha) {
    mensagemEl.innerText = "As senhas não coincidem!";
    return;
  }

  // Envia requisição ao backend
  const response = await fetch(`${url}/alterar-senha`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senha: novaSenha }),
  });

  const data = await response.json();

  // Mostra mensagem de sucesso ou erro retornada pela API
  mensagemEl.innerText = data.message;
  if (data.success) {
    // Redireciona após 2s para a tela de login
    setTimeout(() => window.location.href = "index.html", 2000);
  }
};

// Liga o listener de submit do form
document
  .getElementById("form-confirm-reset-pass")
  .addEventListener("submit", e => {
    e.preventDefault();
    alterarSenha();
  });
