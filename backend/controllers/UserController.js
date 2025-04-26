const UserService = require("../services/UserService");
const EmailService = require("../services/EmailService");
const {gerarTokenEmail} = require("../utils/validators");
const {runQuery} = require("../utils/queryHelper");

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

        if (!nome || !email || !senha) return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });

        try {
            const { email: emailRow, emailToken} = await this.userService.cadastrarUsuario(nome, email, senha);
            await this.emailService.enviarConfirmacaoEmail(emailRow, emailToken);

            return res.status(200).json({ success: true, message: "Cadastro Realizado! Verifique seu Email" });
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

        if (!email || !senha) return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios!" });

        try {
            const { name, token } = await this.userService.loginUsuario(email, senha);
            return res.status(200).json({ success: true, name, token });
        } catch (error) {
            console.error("Erro no login:", error);
            return res.status(401).json({  message: error.message });
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

        if (!email) return res.status(400).json({  message: "E-mail é obrigatório!" });

        try {
            const { emailToken } = await this.userService.redefinirSenha(email);
            await this.emailService.enviarRedefinicaoEmail(email, emailToken);
            return res.status(200).json({ success: true, message: "Redefinicão de senha enviada! Verifique seu Email" });
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            return res.status(500).json({ success: false, message: "Erro ao redefinir senha." });
        }
    }

    /**
     * Verifica a senha criada pelo usuário e atualiza o usuário
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async alterarSenha(req, res) {
        const { email, token, senha, confirmacaoSenha } = req.body;

        if (senha !== confirmacaoSenha) return res.status(400).json({ success: false, message: "As senhas não são iguais!" });

        try {
            const { email: emailRows} = await this.userService.verificarTokenResetPass(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== emailRows) return res.status(400).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });

            await this.userService.alterarSenha(email, senha);
            return res.status(200).json({ success: true, message: "Senha alterada com sucesso!" });
        } catch (error) {
            console.error("Erro ao alterar senha:", email, error);
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

        if (!email || !token) return res.status(400).json({ success: false, message: "Verificação de e-mail inválida!" });

        try {
            const { email: emailRow } = await this.userService.verificarTokenEmail(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== emailRow) return res.status(400).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });

            await this.userService.confirmarEmail(email, token);
            return res.status(200).json({ success: true,  message: "Email verificado!" });
        } catch (error) {
            console.error("Erro na verificação de e-mail:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async reconfirmarEmail(req, res) {
        const email = req.params.email;
        // Email Inexistente
        if (!email) return res.status(400).json({success: false, message: "Email não informado!"})

        try {
            // Busca o email do usuário
            const rows = await this.userService.getUserByEmail(email);
            // Verfica se o Email Existe
            if(!rows) return  res.status(400).json({success: false, message: "Email não existe no Sistema!"})
            // Deleta a chave de e-mail antiga
            await runQuery("delete_token_email_by_email", [email]);
            // Gera um Token de Email
            const { emailToken, expiresAt } = gerarTokenEmail();
            // Insere chave de confirmação de e-mail
            await runQuery("insert_user_email_confirm_keys", [rows.user_id, email, emailToken, expiresAt]);
            // Envia o e-mail para o usuário
            await this.emailService.enviarConfirmacaoEmail(email, emailToken);
            // Mensagem de Sucesso
            return res.status(200).json({ success: true, message: "Email reenviado com sucesso!" });
        } catch (error) {
            console.error("Erro ao confirmar email:", error);
            return res.status(500).json({ success: false, message: "Erro ao reenviar email!", });
        }
    }
}

module.exports = new UserController();
