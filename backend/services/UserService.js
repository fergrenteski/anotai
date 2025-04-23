const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");
const { gerarTokenEmail } = require("../utils/validators");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h";
const SALT_ROUNDS = 10;

class UserService {
    /**
     * Cadastra um novo usuário no sistema.
     * @param {string} nome - Nome do usuário.
     * @param {string} email - E-mail do usuário.
     * @param {string} senha - Senha do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha do cadastro.
     */
    async cadastrarUsuario(nome, email, senha) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_user_by_email, [email]);

        if (rows.length > 0) {
            throw new Error("E-mail já cadastrado!");
        }

        // Criptografa a senha antes de armazenar no banco de dados
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
        const result = await pool.query(queries.insert_user, [nome, email, senhaHash]);
        const userId = result.rows[0].user_id;

        // Gera um token de confirmação de e-mail
        const { emailToken, expiresAt } = gerarTokenEmail();
        await pool.query(queries.insert_user_email_confirm_keys, [userId, email, emailToken, expiresAt]);
        await this.registrarLog(queries.insert_user_log_register, [userId]);

        return { success: true, message: "Cadastro realizado com sucesso! Verifique seu e-mail.", email, emailToken };
    }

    /**
     * Realiza o login do usuário.
     * @param {string} email - E-mail do usuário.
     * @param {string} password - Senha do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha do login.
     */
    async loginUsuario(email, password) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_user_by_email, [email]);

        if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
            throw new Error("E-mail ou senha inválidos!");
        }

        const token = this.gerarToken(rows[0]);
        await this.registrarLog(queries.insert_user_log_login, [rows[0].user_id]);

        return { success: true, message: "Login realizado com sucesso!", token };
    }

    /**
     * Gera um token de redefinição de senha e o associa ao usuário.
     * @param {string} email - E-mail do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha da solicitação de redefinição de senha.
     */
    async redefinirSenha(email) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_user_by_email, [email]);

        if (rows.length === 0) {
            throw new Error("E-mail não encontrado.");
        }

        const userId = rows[0].user_id;
        const { emailToken, expiresAt } = gerarTokenEmail();

        // Remove tokens antigos e insere um novo
        await pool.query(queries.delete_user_reset_password_keys, [userId]);
        await pool.query(queries.insert_user_reset_password_keys, [userId, email, emailToken, expiresAt]);
        await this.registrarLog(queries.insert_user_log_reset_password, [userId]);

        return { success: true, message: "E-mail enviado com sucesso!", emailToken };
    }

    /**
     * Gera um token JWT para autenticação do usuário.
     * @param {Object} usuario - Objeto contendo os dados do usuário.
     * @returns {string} - Token JWT gerado.
     */
    gerarToken(usuario) {
        return jwt.sign(
            { id: usuario.user_id, name: usuario.name, email: usuario.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );
    }

    /**
     * Verifica a validade do token JWT.
     * @param {string} token - Token JWT a ser verificado.
     * @returns {Promise<Object>} - Retorna um objeto indicando se o token é válido.
     */
    async verificarToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return { success: true, valid: true, name: decoded.name };
        } catch (err) {
            return { success: false, message: "Token inválido." };
        }
    }

    /**
     * Verifica se o token de confirmação de e-mail é válido.
     * @param {string} token - Token de confirmação de e-mail.
     * @returns {Promise<Object>} - Retorna um objeto indicando se o token de e-mail é válido.
     */
    async verificarTokenEmail(token) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_user_by_token, [token]);

        if (rows.length === 0) {
            return { success: false, message: "Nenhum usuário encontrado!" };
        }

        return { success: true, message: "Token verificado com sucesso!", email: rows[0].email };
    }

    async verificarTokenResetPass(token) {
        const queries = await loadQueries();
        const { rows } = await pool.query(queries.select_user_by_token_resetpass, [token]);

        if (rows.length === 0) {
            return { success: false, message: "Nenhum usuário encontrado!" };
        }

        return { success: true, message: "Token verificado com sucesso!", email: rows[0].email };

    }

    async alterarSenha(email, senha) {
        const queries = await loadQueries();
        // Criptografa a senha antes de armazenar no banco de dados
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
        const { rows } = await pool.query(queries.update_password_by_email, [email, senhaHash]);
        if (rows.length === 0) {
            throw new Error("Erro ao alterar senha!");
        }
        return { success: true, message: "Senha alterada com sucesso!"};

    }

    /**
     * Confirma o e-mail do usuário e remove o token utilizado.
     * @param {string} email - E-mail do usuário.
     * @param {string} token - Token de confirmação de e-mail.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso da verificação do e-mail.
     */
    async confirmarEmail(email, token) {
        const queries = await loadQueries();
        await pool.query(queries.delete_token_email_by_token, [token]);
        const user = await pool.query(queries.update_verified_user_by_email, [email]);
        await pool.query(queries.insert_user_log_email_confirm, [user.rows[0].user_id])
        return { success: true, message: "E-mail verificado com sucesso!" };
    }

    /**
     * Registra logs de atividades do usuário.
     * @param {string} query - Query SQL para inserção do log.
     * @param {Array} params - Parâmetros da query.
     */
    async registrarLog(query, params) {
        await pool.query(query, params);
    }
}

module.exports = UserService;
