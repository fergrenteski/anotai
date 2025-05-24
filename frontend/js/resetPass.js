import {authFetch} from "./utils/authFetch.js";
import {notificar} from "./utils/notification.js";

const url = "http://localhost:3000/api/user";

async function resetPassword() {
    // Captura o e-mail digitado pelo usuário
    const email = document.getElementById("email").value;

    if (email.length < 5) {
        document.getElementById("mensagem").innerText = "E-mail inválido!";
        return;
    }

    await authFetch(`${url}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    }).then(data => {
        notificar(data.message);
    }).catch(() => {
        // Nada aqui. Silencia completamente.
    })
}

document.getElementById("resetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    resetPassword();
});
