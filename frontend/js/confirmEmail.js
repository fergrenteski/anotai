async function confirmarEmail() {
    const url = "http://localhost:3000/api/user";
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const token = params.get("token");

    const response = await fetch(`${url}/confirmar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
    });

    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message;
}

// Executa a função após o carregamento da página
window.addEventListener("DOMContentLoaded", confirmarEmail);