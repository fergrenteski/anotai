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

  msgEl.innerText = ""; // limpa mensagem anterior

  // 1) Senhas iguais?
  if (novaSenha !== confirmarSenha) {
    msgEl.innerText = "As senhas não coincidem!";
    return;
  }

  // 2) Envia para o back
  try {
    const response = await fetch(`${url}/alterar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        senha: novaSenha,
        confirmacaoSenha // reforço de segurança
      })
    });
    const data = await response.json();

    // 3) Exibe exatamente o que o back retornar
    msgEl.innerText = data.message;

    // 4) Se sucesso, redireciona
    if (data.success) {
      setTimeout(() => window.location.href = "index.html", 2000);
    }

  } catch (err) {
    console.error("Erro no fetch:", err);
    msgEl.innerText = "Erro ao enviar requisição.";
  }
}


// Usa o botão de tipo "button" para não submeter o form
document
  .getElementById("button-confirm-reset")
  .addEventListener("click", alterarSenha);
