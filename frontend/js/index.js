// Elementos do DOM
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

// Alternar entre telas de login e cadastro
const toggleForms = (showSignup) => {
    // Limpeza de campos 
    elements.inputEmailLogin.value = "";
    elements.inputEmailCadastro.value = "";
    elements.senhaInput.value = "";
    elements.confirmarInput.value = "";
    elements.inputSenhaLogin.value = "";
    elements.inputName.value = "";
    // Troca de formularios LOGIN/CADASTRO
    document.querySelector('.container').classList.toggle('active', showSignup);
    document.getElementById('login-info').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-info').style.display = showSignup ? 'block' : 'none';
    document.getElementById('login-container').style.display = showSignup ? 'none' : 'block';
    document.getElementById('signup-container').style.display = showSignup ? 'block' : 'none';
};

// Validação de senha
const validarSenhas = () => {
    const { senhaInput, confirmarInput, mensagemCadastro, buttonCriar } = elements;
    const senha = senhaInput.value;
    const confirmarSenha = confirmarInput.value;

    if (senha.length < 8) {
        mensagemCadastro.innerHTML = "A senha deve ter pelo menos 8 caracteres!";
        buttonCriar.disabled = true;
        senhaInput.classList.add("invalid");
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

// Função genérica para requisições de autenticação
const autenticar = async (endpoint, dados) => {
    return await fetch(`http://localhost:3000/api/user/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
    });
};

// Login
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
        inputEmailLogin.classList.add("invalid");
        inputSenhaLogin.classList.add("invalid");
    }
};

// Cadastro
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

    const data = await response.json()

    if (data.success) {
        mensagemCadastro.innerText = ''
        window.location.href = `email.html?email=${inputEmailCadastro.value}`;
    } else {
        mensagemCadastro.innerText = data.message;
        inputEmailCadastro.classList.add("invalid");
        mensagemCadastro.style.color = "red";
    }
};

// Evento para realizar o cadastro do sistema
elements.formSignup.addEventListener("submit", (e) => {
    e.preventDefault();
    cadastrar();
});

// Evento para realizar o login do sistema
elements.formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    login();
});

// Evento de remocao do estado invalido do campo email de login
elements.inputEmailLogin.addEventListener("focus", () => elements.inputEmailLogin.classList.remove("invalid"));

// Evento de remocao do estado invalido do campo email do cadastro
elements.inputEmailCadastro.addEventListener("focus", () => elements.inputEmailCadastro.classList.remove("invalid"));

// Evento de remocao do estado invalido do campo senha do login
elements.inputSenhaLogin.addEventListener("focus", () => elements.inputSenhaLogin.classList.remove("invalid"));

// Evento para troca de formularios
elements.showSignup.addEventListener("click", () => toggleForms(true));

elements.showLogin.addEventListener("click", () => toggleForms(false));

// Evento para realizar a validacao de senha
elements.senhaInput.addEventListener("input", validarSenhas);

elements.confirmarInput.addEventListener("input", validarSenhas);

// Adicionando evento do botao responsavel por mostrar e esconder senha
// Campo de senha
elements.buttonMostrarSenha.addEventListener("click", (e) => {
    e.preventDefault();
    elements.senhaInput.type = elements.senhaInput.type === "password" ? "text" : "password";
    document.getElementById("pass-i").classList.toggle("fa-eye");
    document.getElementById("pass-i").classList.toggle("fa-eye-slash");
});


// Adicionando evento do botao responsavel por mostrar e esconder senha
// Campo de confirmar a senha
elements.buttonMostrarConfirmarSenha.addEventListener("click", (e) => {
    e.preventDefault();
    elements.confirmarInput.type = elements.confirmarInput.type === "password" ? "text" : "password";
    document.getElementById("conf-i").classList.toggle("fa-eye");
    document.getElementById("conf-i").classList.toggle("fa-eye-slash");
});
