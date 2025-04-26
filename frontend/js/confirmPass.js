// URL base da API de usuário para operações de redefinição de senha
const url = "http://localhost:3000/api/user";

// Captura os parâmetros da query string da URL
const params = new URLSearchParams(window.location.search);

// Obtém o email e o token da confirmação
const email = params.get("email");
const token = params.get("token");

// Função assíncrona para enviar a nova senha ao back-end
const alterarSenha = async () => {
    // Lê os valores dos campos de senha e confirmação
    const senha = document.getElementById("senha").value;
    const confirmacaoSenha = document.getElementById("confirmarSenha").value;

    // Faz a requisição POST para alterar a senha
    const response = await fetch(`${url}/alterar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, senha, confirmacaoSenha }),
    });

    // Converte a resposta em JSON e exibe a mensagem na página
    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message;
}

// Intercepta o submit do formulário para executar alterarSenha sem recarregar
document
    .getElementById("form-confirm-reset-pass")
    .addEventListener("submit", (e) => {
        e.preventDefault();
        alterarSenha();
    });
