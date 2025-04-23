const url = "http://localhost:3000/api/user";

// Captura os parâmetros da URL
const params = new URLSearchParams(window.location.search);

// Obtém os valores de 'email' e 'token'
const email = params.get("email");
const token = params.get("token");

const response = await fetch(`${url}/confirmar-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
});

const data = await response.json();
document.getElementById("mensagem").innerText = data.message;