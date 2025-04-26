// Confirma e-mail do usuário usando token da URL
async function confirmarEmail() {
    const url = "http://localhost:3000/api/user"; // API base

    const params = new URLSearchParams(window.location.search);
    const email = params.get("email"); // Email do usuário
    const token = params.get("token"); // Token de confirmação

    const response = await fetch(`${url}/confirmar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }), // Envia email e token
    });

    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message; // Mostra retorno
}

// Executa a função após o carregamento da página
window.addEventListener("DOMContentLoaded", confirmarEmail);
