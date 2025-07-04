// Seleciona elementos do DOM usados na página
const elements = {
    inputEmailCadastro: document.getElementById("emailCadastro"),
    inputEmailLogin: document.getElementById("emailLogin"),
    inputSenhaLogin: document.getElementById("senhaLogin"),
    formLogin: document.getElementById("form-login"),
    formSignup: document.getElementById("form-signup"),
    buttonMostrarSenha: document.getElementById("btn-show-pass"),
    buttonMostrarConfirmarSenha: document.getElementById("btn-show-confirm-pass"),
    confirmarInput: document.getElementById("confirmarSenhaCadastro"),
    senhaInput: document.getElementById("senhaCadastro"),
    mensagemCadastro: document.getElementById("mensagemCadastro"),
    buttonCriar: document.getElementById("button-signup"),
    mensagemLogin: document.getElementById("mensagemLogin"),
    showSignup: document.getElementById("show-signup"),
    showLogin: document.getElementById("show-login"),
    inputName: document.getElementById("nomeCadastro"),
};

// Limpa campos e alterna entre formulários de login e cadastro
const toggleForms = (showSignup) => {
    elements.inputEmailLogin.value = "";
    elements.inputEmailCadastro.value = "";
    elements.senhaInput.value = "";
    elements.confirmarInput.value = "";
    elements.inputSenhaLogin.value = "";
    elements.inputName.value = "";
    document.querySelector('.container').classList.toggle('active', showSignup);
    document.getElementById('login-info').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-info').style.display = showSignup ? 'block' : 'none';
    document.getElementById('login-container').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-container').style.display = showSignup ? 'block' : 'none';
};

// Valida comprimento e igualdade das senhas no cadastro
const validarSenhas = () => {
    const { senhaInput, confirmarInput, mensagemCadastro, buttonCriar } = elements;
    const senha = senhaInput.value;
    const confirmarSenha = confirmarInput.value;

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
        mensagemCadastro.innerHTML = "A senha não atende aos requisitos!";
        buttonCriar.disabled = true;
        senhaInput.classList.add("invalid");
        senhaInput.classList.remove("valid");
        return;
    }

    if (senha === confirmarSenha) {
        confirmarInput.classList.add("valid");
        confirmarInput.classList.remove("invalid");
        mensagemCadastro.innerHTML = "";
        buttonCriar.disabled = false;
        buttonCriar.classList.add("enabled");
        senhaInput.classList.add("valid");
        senhaInput.classList.remove("invalid");
    } else {
        confirmarInput.classList.add("invalid");
        confirmarInput.classList.remove("valid");
        mensagemCadastro.innerHTML = "As senhas não coincidem!";
        buttonCriar.disabled = true;
        senhaInput.classList.remove("valid");
    }
};

// Envia requisições genéricas para autenticação de usuário
const autenticar = async (endpoint, dados) => {
    return await fetch(`http://localhost:3000/api/user/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    });
};

// Realiza login e armazena token na sessão
const login = async () => {
    const { inputEmailLogin, inputSenhaLogin, mensagemLogin } = elements;
    const response = await autenticar("login", {
        email: inputEmailLogin.value,
        senha: inputSenhaLogin.value,
    });

    const data = await response.json();

    if (data.success) {
        sessionStorage.setItem("token", data.token);
        window.location.href = "home.html";
    } else {
        mensagemLogin.innerText = data.message;
        if (data.status === 403) {
            inputEmailLogin.classList.add("invalid");
        } else if (data.status === 401) {
            inputSenhaLogin.classList.add("invalid");
        } else {
            inputEmailLogin.classList.add("invalid");
            inputSenhaLogin.classList.add("invalid");
        }
    }
};

// Realiza cadastro de novo usuário
const cadastrar = async () => {
    const { senhaInput, confirmarInput, mensagemCadastro, inputEmailCadastro } = elements;

    if (senhaInput.value !== confirmarInput.value) {
        mensagemCadastro.innerText = "As senhas não coincidem!";
        return;
    }

    const response = await autenticar("cadastro", {
        nome: document.getElementById("nomeCadastro").value,
        email: inputEmailCadastro.value,
        senha: senhaInput.value,
    });

    const data = await response.json();

    if (data.success) {
        mensagemCadastro.innerText = ''
        window.location.href = `email.html?email=${inputEmailCadastro.value}`;
    } else {
        mensagemCadastro.innerText = data.message;
        inputEmailCadastro.classList.add("invalid");
        mensagemCadastro.style.color = "red";
    }
};

// Impede envio padrão e chama função de cadastro
elements.formSignup.addEventListener("submit", (e) => {
    e.preventDefault();
    cadastrar();
});

// Impede envio padrão e chama função de login
elements.formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

// Remove estado de campo inválido ao focar
elements.inputEmailLogin.addEventListener("focus", () => elements.inputEmailLogin.classList.remove("invalid"));
elements.inputEmailCadastro.addEventListener("focus", () => elements.inputEmailCadastro.classList.remove("invalid"));
elements.inputSenhaLogin.addEventListener("focus", () => elements.inputSenhaLogin.classList.remove("invalid"));

// Define eventos para alternar formulários e validar senhas
elements.showSignup.addEventListener("click", () => toggleForms(true));
elements.showLogin.addEventListener("click", () => toggleForms(false));
elements.senhaInput.addEventListener("input", validarSenhas);
elements.confirmarInput.addEventListener("input", validarSenhas);

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
    elements.confirmarInput.type = elements.confirmarInput.type === "password" ? "text" : "password";
    document.getElementById("conf-i").classList.toggle("fa-eye");
    document.getElementById("conf-i").classList.toggle("fa-eye-slash");
});
