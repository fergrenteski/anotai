
const url = "http://localhost:3000/api/user";

async function resetPassword() {
    // Captura o e-mail digitado pelo usuário
    const email = document.getElementById("email").value;

    if (email.length < 5) {
        document.getElementById("mensagem").innerText = "E-mail inválido!";
        return;
    }

    const response = await fetch(`${url}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await response.json();
    document.getElementById("mensagem").innerText = data.message;
}

document.getElementById("resetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    resetPassword();
});
