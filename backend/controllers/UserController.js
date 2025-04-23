const UserService = require("../services/UserService");
const EmailService = require("../services/EmailService");

class UserController {
    constructor() {
        this.userService = new UserService();
        this.emailService = new EmailService();
    }

    /**
     * Cadastra um novo usuário e envia um e-mail de confirmação.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async cadastro(req, res) {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
        }

        try {
            const data = await this.userService.cadastrarUsuario(nome, email, senha);
            await this.emailService.enviarConfirmacaoEmail(data.email, data.emailToken);
            return res.status(201).json({ success: true, message: data.message });
        } catch (error) {
            console.error("Erro no cadastro:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Realiza o login do usuário e retorna um token.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async login(req, res) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios!" });
        }

        try {
            const { message, token } = await this.userService.loginUsuario(email, senha);
            return res.status(200).json({ success: true, message, token });
        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(401).json({ success: false, message: "E-mail ou senha inválidos!" });
        }
    }

    /**
     * Verifica se o token de autenticação é válido.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async verificarToken(req, res) {
        return res.status(200).json({ success: true, message: "Usuário Autenticado", user: req.usuario });
    }

    /**
     * Solicita a redefinição de senha e envia um e-mail com o token de redefinição.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async redefinirSenha(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "E-mail é obrigatório!" });
        }

        try {
            const { message, emailToken } = await this.userService.redefinirSenha(email);
            await this.emailService.enviarRedefinicaoEmail(email, emailToken);
            return res.status(200).json({ success: true, message });
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            return res.status(500).json({ success: false, message: "Erro ao redefinir senha." });
        }
    }

    async alterarSenha(req, res) {
        const { email, token, senha, confirmacaoSenha } = req.body;
        if (senha !== confirmacaoSenha) {
            return res.status(400).json({ success: false, message: "As senhas não são iguais!" });
        }
        try {
            const response = await this.userService.verificarTokenResetPass(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== response.email) {
                return res.status(403).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });
            }

            const { message } = await this.userService.alterarSenha(email, senha);
            return res.status(200).json({ success: true, message });
        } catch (error) {
            console.error("Erro ao alterar senha:",email, error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Confirma a verificação do e-mail do usuário.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async confirmarEmail(req, res) {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ success: false, message: "Verificação de e-mail inválida!" });
        }

        try {
            const response = await this.userService.verificarTokenEmail(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== response.email) {
                return res.status(403).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });
            }

            const { message } = await this.userService.confirmarEmail(email);
            return res.status(200).json({ success: true, message });
        } catch (error) {
            console.error("Erro na verificação de e-mail:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
