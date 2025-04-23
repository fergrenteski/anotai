const url = "http://localhost:3000/api/user";

// Captura os parâmetros da URL
const params = new URLSearchParams(window.location.search);

// Obtém os valores de 'email' e 'token'
const email = params.get("email");
const token = params.get("token");

const alterarSenha = async () => {
    const senha = document.getElementById("senha").value;
    const confirmacaoSenha = document.getElementById("confirmarSenha").value;
    try {
        const response = await fetch(`${url}/alterar-senha`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, senha, confirmacaoSenha }),
        });
        const data = await response.json();
        document.getElementById("mensagem").innerText = data.message;
    } catch(error) {
        document.getElementById("mensagem").innerText = "Erro ao alterar senha!";
    }
}

document.getElementById("form-confirm-reset-pass").addEventListener("submit", (e) => {
    e.preventDefault();
    alterarSenha();
});
