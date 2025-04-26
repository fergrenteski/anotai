// Importa bibliotecas e funçöes:
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

        // Extrai dados da requisição
        const { nome, email, senha } = req.body;

        // Identifica os campos obrigatórios e caso não foram preenchidos retorna erro
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

        // Extrai dados da requisição
        const { email, senha } = req.body;

        if (!email || !senha) return res.status(400).json({ success: false, message: "E-mail e senha são obrigatórios!" });

        try {
            
             // Chama serviço de autenticação (login) que precisa  email e senha
            const { name, token } = await this.userService.loginUsuario(email, senha);
            
            // Retorna token para o cliente
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

        //função e retorno na mesma linha:
        if (!email) return res.status(400).json({  message: "E-mail é obrigatório!" });

        // Gera token de reset e envia por e-mail
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

            // Recupera o e-mail associado ao token
            const { email: emailRows} = await this.userService.verificarTokenResetPass(token);

            // Verifica o e-mail informado.
            if (email !== emailRows) return res.status(400).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });
            
             // Atualiza senha no banco
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

        // Extrai dados da requisição
        const { email, token } = req.body;

        if (!email || !token) return res.status(400).json({ success: false, message: "Verificação de e-mail inválida!" });

        try {
            const { email: emailRow } = await this.userService.verificarTokenEmail(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== emailRow) return res.status(400).json({ success: false, message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token." });

            // Marca usuário como verificado
            await this.userService.confirmarEmail(email, token);
            return res.status(200).json({ success: true,  message: "Email verificado!" });
        } catch (error) {
            console.error("Erro na verificação de e-mail:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
// Exporta o UserController
module.exports = new UserController();
