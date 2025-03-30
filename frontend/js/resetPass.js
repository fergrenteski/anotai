import API_URLS from "./utils/env.js";

const url = API_URLS.EMAIL_URL;
async function resetPassword() {
    const email = document.getElementById("email").value;
    if (email.length < 5) {
        document.getElementById("mensagem").innerText = "E-mail Invalido!";
        return;
    }
    const response = await fetch(`${url}/resetarSenha`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email })
    });

    const data = await response.json();

    if(data.error){
        document.getElementById("mensagem").innerText = data.error;
    }

}

document.getElementById("resetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    resetPassword();
})
