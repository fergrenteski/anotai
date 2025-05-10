// URL base da API
const url = "http://localhost:3000/api/user";
// Captura token da query string (?token=)
const params = new URLSearchParams(window.location.search);
const token  = params.get("token") || "";

// Função principal para validar e enviar
async function alterarSenha() {
  const novaSenha      = document.getElementById("senha").value.trim();
  const confirmarSenha = document.getElementById("confirmarSenha").value.trim();
  const msgEl          = document.getElementById("mensagem");

  // limpa mensagem anterior
  msgEl.innerText = "";

  // DEBUG: veja no console o que está chegando
  console.log("alterarSenha() → novaSenha:", novaSenha, "confirmarSenha:", confirmarSenha);

  // 1) Campos obrigatórios
  if (!novaSenha || !confirmarSenha) {
    msgEl.innerText = "Todos os campos são obrigatórios!";
    return;
  }

  // 2) Senhas iguais?
  if (novaSenha !== confirmarSenha) {
    msgEl.innerText = "As senhas não coincidem!";
    return;
  }

  // 3) Envia para o back
  try {
    const response = await fetch(`${url}/alterar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha: novaSenha })
    });
    const data = await response.json();

    // exibe mensagem da API
    msgEl.innerText = data.message || (data.success
      ? "Senha alterada com sucesso!"
      : "Erro ao alterar senha.");

    // em caso de sucesso, redireciona depois de 2s
    if (data.success) {
      setTimeout(() => window.location.href = "index.html", 2000);
    }

  } catch (err) {
    console.error("Erro no fetch:", err);
    msgEl.innerText = "Erro ao enviar requisição.";
  }
}

// atrelamos ao clique do botão, não ao submit do form
document
  .getElementById("button-confirm-reset")
  .addEventListener("click", alterarSenha);
