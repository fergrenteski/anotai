// URL base da API de usuário para operações de redefinição de senha
import {notificar} from "./utils/notification.js";

const url = "http://localhost:3000/api/user";

const elements = {
    senhaInput: document.getElementById('senha'),
    confirmarSenhaInput: document.getElementById('confirmarSenha'),
    buttonCriar: document.getElementById('button-confirm-reset'),
    buttonMostrarSenha: document.getElementById("btn-show-pass"),
    buttonMostrarConfirmarSenha: document.getElementById("btn-show-confirm-pass"),
    message: document.getElementById('message'),
};

// Captura os parâmetros da query string da URL
const params = new URLSearchParams(window.location.search);

// Obtém o email e o token da confirmação
const email = params.get("email");
const token = params.get("token");

const validarSenhas = () => {
    const { senhaInput, confirmarSenhaInput, buttonCriar, message} = elements;

    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    const comprimentoValido = senha.length >= 8;
    const temMaiuscula = /[A-Z]/.test(senha);
    const temNumero = /\d/.test(senha);
    const temEspecial = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(senha);

    // Atualizar visual da listinha
    document.getElementById("req-comprimento").classList.toggle("ok", comprimentoValido);
    document.getElementById("req-maiuscula").classList.toggle("ok", temMaiuscula);
    document.getElementById("req-numero").classList.toggle("ok", temNumero);
    document.getElementById("req-especial").classList.toggle("ok", temEspecial);

    const senhaValida = comprimentoValido && temMaiuscula && temNumero && temEspecial;

    if (!senhaValida) {
        message.innerHTML = "A senha não atende aos requisitos!";
        buttonCriar.disabled = true;
        senhaInput.classList.add("invalid");
        senhaInput.classList.remove("valid");
        return;
    }

    if (senha === confirmarSenha) {
        confirmarSenhaInput.classList.add("valid");
        confirmarSenhaInput.classList.remove("invalid");
        message.innerHTML = "";
        buttonCriar.disabled = false;
        buttonCriar.classList.add("enabled");
        senhaInput.classList.add("valid");
        senhaInput.classList.remove("invalid");
    } else {
        confirmarSenhaInput.classList.add("invalid");
        confirmarSenhaInput.classList.remove("valid");
        message.innerHTML = "As senhas não coincidem!";
        buttonCriar.disabled = true;
        senhaInput.classList.remove("valid");
    }
};

// Função assíncrona para enviar a nova senha ao back-end
async function alterarSenha() {
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

    if(!data.success) {
        elements.message.innerText = data.message;
    } else {
        notificar(data.message).then(() => {
            window.location.href="index.html";
        });
    }

}

// Intercepta o submit do formulário para executar alterarSenha sem recarregar
document
    .getElementById("form-confirm-reset-pass")
    .addEventListener("submit", async(e) => {
        e.preventDefault();
        await alterarSenha();
    });

elements.senhaInput.addEventListener("input", validarSenhas);
elements.confirmarSenhaInput.addEventListener("input", validarSenhas);

// Adiciona funcionalidade de mostrar/ocultar senha no cadastro
elements.buttonMostrarSenha.addEventListener("click", (e) => {
    e.preventDefault();
    elements.senhaInput.type = elements.senhaInput.type === "password" ? "text" : "password";
    document.getElementById("pass-i").classList.toggle("fa-eye");
    document.getElementById("pass-i").classList.toggle("fa-eye-slash");
});

// Adiciona funcionalidade de mostrar/ocultar confirmação de senha
elements.buttonMostrarConfirmarSenha.addEventListener("click", (e) => {
    e.preventDefault();
    elements.confirmarSenhaInput.type = elements.confirmarSenhaInput.type === "password" ? "text" : "password";
    document.getElementById("conf-i").classList.toggle("fa-eye");
    document.getElementById("conf-i").classList.toggle("fa-eye-slash");
});