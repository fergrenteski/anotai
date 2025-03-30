// Função para validar o formato do e-mail
const validarEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
};

// Função para criar o link de redefinição de senha
const gerarLinkRedefinicao = (email, token) => {
    const url = process.env.FRONTEND_URL || 'http://localhost:8080'; // Permite configuração de URL no frontend
    return `${url}/confirmPass.html?email=${email}&token=${token}`;
};

module.exports = { validarEmail, gerarLinkRedefinicao };
