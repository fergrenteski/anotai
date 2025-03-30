import API_URLS from "./utils/env.js";
const url = API_URLS.AUTH_URL;

const inputEmailCadastro = document.getElementById("emailCadastro");
const inputEmailLogin = document.getElementById("emailLogin");
const inputSenhaLogin = document.getElementById("senhaLogin");
const formLogin = document.getElementById("form-login");
const formSignup = document.getElementById("form-signup");

// Função para alternar entre as telas de login e cadastro
function toggleForms(showSignup) {
    document.querySelector('.container').classList.toggle('active', showSignup);
    document.getElementById('login-info').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-info').style.display = showSignup ? 'block' : 'none';
    document.getElementById('login-container').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-container').style.display = showSignup ? 'block' : 'none';
}

// Função de validação de senhas
function validarSenhas() {
    const senha = document.getElementById("senhaCadastro").value;
    const senhaInput = document.getElementById("senhaCadastro");
    const confirmarSenha = document.getElementById("confirmarSenhaCadastro").value;
    const confirmarInput = document.getElementById("confirmarSenhaCadastro");
    const mensagem = document.getElementById("mensagemCadastro");
    const buttonCriar = document.getElementById("button-signup");

    if (senha.length >= 8 || confirmarSenha.length >= 8) {
        if (senha === confirmarSenha) {
            confirmarInput.classList.add("valid");
            confirmarInput.classList.remove("invalid");
            mensagem.innerHTML = "";
            buttonCriar.disabled = false;
            buttonCriar.classList.add("enabled");
            senhaInput.classList.remove("invalid");
            senhaInput.classList.add("valid");
        } else {
            confirmarInput.classList.add("invalid");
            confirmarInput.classList.remove("valid");
            mensagem.innerHTML = "As senhas não coincidem!";
            buttonCriar.disabled = true;
            buttonCriar.classList.remove("enabled");
            senhaInput.classList.remove("invalid", "valid");
        }
    } else {
        confirmarInput.classList.remove("valid", "invalid");
        buttonCriar.disabled = true;
        mensagem.innerHTML = "A Senha deve conter pelo menos 8 caracteres!";
        buttonCriar.classList.remove("enabled");
        senhaInput.classList.add("invalid");
    }
}

// Função para fazer o login
async function autenticar(url, dados) {
    const resposta = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dados)
    });

    return await resposta.json();
}

// Função para o login
async function login() {
    const email = document.getElementById("emailLogin").value;
    const senha = document.getElementById("senhaLogin").value;

    const data = await autenticar(`${url}/login`, {email, senha});

    if (data.token) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "home.html";
    } else {
        document.getElementById("mensagemLogin").innerText = data.error;
        document.getElementById("emailLogin").classList.add("invalid");
        document.getElementById("senhaLogin").classList.add("invalid");
    }
}

// Função para cadastrar o usuário
async function cadastrar() {
    const nome = document.getElementById("nomeCadastro").value;
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;
    const confirmacaoSenha = document.getElementById("confirmarSenhaCadastro").value;

    if (senha !== confirmacaoSenha) {
        document.getElementById("mensagemCadastro").innerText = "As senhas não coincidem!";
        return;
    }

    if (senha.length < 8) {
        document.getElementById("mensagemCadastro").innerText = "A senha deve ter pelo menos 8 caracteres";
        return;
    }

    const data = await autenticar(`${url}/cadastro`, {nome, email, senha});

    if (data.token) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "index.html";
    } else {
        document.getElementById("mensagemCadastro").innerText = data.error;
        inputEmailCadastro.classList.add("invalid");
    }
}

// Submissão do formulário de cadastro
formSignup.addEventListener("submit", (event) => {
    event.preventDefault();
    cadastrar();
});

// Submissão do formulário de login
formLogin.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
});

// Remove a classe de cor vermelha do Input
inputEmailLogin.addEventListener("focus", () => {
    inputEmailLogin.classList.remove("invalid");
})

// Remove a classe de cor vermelha do Input
inputEmailCadastro.addEventListener("focus", () => {
    inputEmailCadastro.classList.remove("invalid");
})

// Remove a classe de cor vermelha do Input
inputSenhaLogin.addEventListener("focus", () => {
    inputSenhaLogin.classList.remove("invalid");
})

// Alterar a tela para o cadastro
document.getElementById('show-signup').addEventListener('click', () => toggleForms(true));

// Alterar a tela para o login
document.getElementById('show-login').addEventListener('click', () => toggleForms(false));

document.getElementById("senhaCadastro").addEventListener("input", validarSenhas);

document.getElementById("confirmarSenhaCadastro").addEventListener("input", validarSenhas);
