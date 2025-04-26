// URL base da API de usuário para operações de senha
const url = "http://localhost:3000/api/user";

// Envia pedido de redefinição de senha para o backend
async function resetPassword() {
    // Captura o e-mail digitado pelo usuário
    const email = document.getElementById("email").value;

    // Valida tamanho mínimo do e-mail
    if (email.length < 5) {
        document.getElementById("mensagem").innerText = "E-mail inválido!";
        return;
    }

    // Chama a rota de redefinição de senha via POST
    const response = await fetch(`${url}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    // Lê a resposta e exibe a mensagem retornada
    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message;
}

// Dispara a função ao submeter o formulário
document.getElementById("resetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    resetPassword();
});
