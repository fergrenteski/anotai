const UserService = require('../services/UserService');

class UserController {
    static async cadastro(req, res) {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
        }

        try {
            const userService = new UserService();
            const { message, token } = await userService.cadastrarUsuario(nome, email, senha);
            res.json({ message, token });
        } catch (error) {
            console.error("Erro no cadastro:", error);
            res.status(500).json({ error: "Erro ao cadastrar usuário." });
        }
    }

    static async login(req, res) {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios!" });
        }

        try {
            const userService = new UserService();
            const { message, token } = await userService.loginUsuario(email, senha);
            res.json({ message, token });
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ error: "Erro ao realizar login." });
        }
    }

    static async verificarToken(req, res) {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Token não fornecido" });
        }

        try {
            const userService = new UserService();
            const result = await userService.verificarToken(token);
            res.json(result);
        } catch (err) {
            res.status(401).json({ message: "Token inválido" });
        }
    }
// Função para redefinir senha
    static async redefinirSenha(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "E-mail é obrigatório!" });
        }

        try {
            const userService = new UserService();
            const { message, token } = await userService.redefinirSenha(email);

            // Aqui, você utiliza o serviço de e-mail
            const emailService = new EmailService();
            await emailService.enviarEmail(email, token);  // Envia o link de redefinição

            res.json({ message, token });
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            res.status(500).json({ error: "Erro ao redefinir senha." });
        }
    }
}

module.exports = UserController
