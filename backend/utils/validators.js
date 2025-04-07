const crypto = require("crypto");

/**
 * Valida o formato de um endereço de e-mail.
 * @param {string} email - O e-mail a ser validado.
 * @returns {boolean} Retorna `true` se o e-mail for válido, caso contrário, `false`.
 */
const validarEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

/**
 * Gera um link para confirmação ou redefinição de senha.
 * @param {string} tipo - O tipo de link a ser gerado ('confirmEmail' ou 'confirmPass').
 * @param {string} email - O e-mail do usuário.
 * @param {string} token - O token associado à ação.
 * @returns {string} Retorna o link gerado.
 */
const gerarLink = (tipo, email, token) => {
    const urlBase = process.env.FRONTEND_URL || 'http://localhost:8080';
    const paths = {
        confirmEmail: "confirmEmail.html",
        confirmPass: "confirmPass.html"
    };

    return `${urlBase}/${paths[tipo]}?email=${email}&token=${token}`;
};

/**
 * Gera um token de verificação por e-mail e define sua expiração.
 * @returns {{ emailToken: string, expiresAt: Date }} Retorna um objeto contendo o token e a data de expiração.
 */
const gerarTokenEmail = () => ({
    emailToken: crypto.randomBytes(20).toString("hex"),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000) // Expira em 1 hora
});

module.exports = {
    validarEmail,
    gerarLink,
    gerarTokenEmail
};
