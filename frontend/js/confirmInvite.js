// URL base da API de usuário para operações de grupo
const url = "http://localhost:3000/api/groups";

// Captura os parâmetros da query string da URL
const params = new URLSearchParams(window.location.search);

// Obtém o email e o token da confirmação
const userId = params.get("userid");
const groupId = params.get("groupid");
const token = params.get("token");
const accept = params.get("accept");

// Função assíncrona para enviar a confirmação de convite de grupo
const enviarInvite = async () => {

    // Faz a requisição POST para alterar a senha
    const response = await fetch(`${url}/${groupId}/members/${userId}/invite/${token}/accept/${accept}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });

    // Converte a resposta em JSON e exibe a mensagem na página
    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message;
}

// Intercepta o submit do formulário para executar alterarSenha sem recarregar
document.addEventListener("DOMContentLoaded", async (e) => {
        e.preventDefault();
        await enviarInvite();
    });
