// Importa bibliotecas e funçöes:
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {gerarTokenEmail} = require("../utils/validators");
const {runQuery} = require("../utils/queryHelper");

const JWT_SECRET = process.env.JWT_SECRET; // Segredo utilizado para assinar os tokens JWT
const JWT_EXPIRATION = "1h"; // Tempo de expiração do token JWT
const SALT_ROUNDS = 10; // Complexidade do hash

class UserService {
    /**
     * Cadastra um novo usuário no sistema.
     * @param {string} nome - Nome do usuário.
     * @param {string} email - E-mail do usuário.
     * @param {string} senha - Senha do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha do cadastro.
     */
    async cadastrarUsuario(nome, email, senha) {

        // Verifica se o e-mail já está cadastrado
        const {rows: existingUsers} = await runQuery("select_user_by_email", [email]);
        if (existingUsers.length > 0) throw new Error("E-mail já cadastrado!");

        // Criptografa a senha
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        // Insere o novo usuário
        const {rows: newUserRows} = await runQuery("insert_user", [nome, email, senhaHash]);
        const userId = newUserRows[0].user_id;

        // Gera token de confirmação
        const {emailToken, expiresAt} = gerarTokenEmail();

        // Insere chave de confirmação de e-mail
        await runQuery("insert_user_email_confirm_keys", [userId, email, emailToken, expiresAt]);

        // Registra log de criação
        await runQuery("insert_user_log_register", [userId]);
        return {email, emailToken};
    }

    /**
     * Realiza o login do usuário.
     * @param {string} email - E-mail do usuário.
     * @param {string} password - Senha do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha do login.
     */
    async loginUsuario(email, password) {

        const {rows} = await runQuery("select_user_by_email", [email]);
        // E-mail não encontrado
        if (rows.length === 0) {
            const error = new Error("E-mail não encontrado");
            error.status = 403;
            throw error;
        }

        // Usuário não Verificado
        if (!rows[0].email_verified) throw new Error("Usuário não verificado!");

        // Senha incorreta
        const isMatch = await bcrypt.compare(password, rows[0].password_hash);
        if (!isMatch) {
            const error = new Error("Senha incorreta");
            error.status = 401;
            throw error;
        }

        // Sucesso
        const token = this.gerarToken(rows[0]);
        await runQuery("insert_user_log_login", [rows[0].user_id]);
        return {token, name: rows[0].name};
    }

    /**
     * Gera um token de redefinição de senha e o associa ao usuário.
     * @param {Number} userId - Identificador do usuário.
     * @param {string} email - E-mail do usuário.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso ou falha da solicitação de redefinição de senha.
     */
    async redefinirSenha(userId, email) {
        const { emailToken, expiresAt } = gerarTokenEmail();

        // Remove tokens antigos e insere um novo
        await runQuery("delete_user_reset_password_keys", [userId]);
        await runQuery("insert_user_reset_password_keys", [userId, email, emailToken, expiresAt]);
        await runQuery("insert_user_log_reset_password", [userId]);

        return { emailToken };
    }

    /**
     * Gera um token JWT para autenticação do usuário.
     * @param {Object} usuario - Objeto contendo os dados do usuário.
     * @returns {string} - Token JWT gerado.
     */
    gerarToken(usuario) {
        return jwt.sign(
            {id: usuario.user_id, name: usuario.name, email: usuario.email},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRATION}
        );
    }

    /**
     * Verifica se o token de confirmação de e-mail é válido.
     * @param {string} token - Token de confirmação de e-mail.
     * @returns {Promise<Object>} - Retorna um objeto indicando se o token de e-mail é válido.
     */
    async verificarTokenEmail(token) {
        const {rows} = await runQuery("select_user_by_token", [token]);

        if (rows.length === 0) throw new Error("Nenhum usuário encontrado!");

        return {email: rows[0].email};
    }

    async verificarTokenResetPass(token) {
        const {rows} = await runQuery("select_user_by_token_resetpass", [token]);

        if (rows.length === 0) throw new Error("Nenhum usuário encontrado!");

        return {email: rows[0].email};
    }

    async alterarSenha(email, senha) {

        // Criptografa a senha antes de armazenar no banco de dados
        const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

        const {rows} = await runQuery("update_password_by_email", [email, senhaHash]);

        if (rows.length === 0) throw new Error("Erro ao alterar senha!");
    }

    /**
     * Confirma o e-mail do usuário e remove o token utilizado.
     * @param {string} email - E-mail do usuário.
     * @param {string} token - Token de confirmação de e-mail.
     * @returns {Promise<Object>} - Retorna um objeto indicando o sucesso da verificação do e-mail.
     */
    async confirmarEmail(email, token) {
        const {rows} = await runQuery("update_verified_user_by_email", [email]);

        if (!rows) throw new Error("Erro ao verificar Email!");

        if (rows[0].length === 0) throw new Error("Usuário não foi verificado");

        await runQuery("delete_token_email_by_token", [token]);

        await runQuery("insert_user_log_email_confirm", [rows[0]?.user_id]);
    }

    async getUserByEmail(email) {
        const {rows} = await runQuery("select_user_by_email", [email]);
        return rows[0];
    }

    async alterarSenhaAutenticado(userId, senhaAtual, novaSenha) {
        const {rows} = await runQuery("select_user_by_id", [userId]);
        if (!rows.length) throw new Error("Usuário não encontrado.");

        const senhaValida = await bcrypt.compare(senhaAtual, rows[0].password_hash);
        if (!senhaValida) throw new Error("Senha atual incorreta.");

        const novaSenhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
        await runQuery("update_password_by_user_id", [novaSenhaHash, userId]);
    }

    /**
     * Atualiza os dados do perfil do usuário.
     * @param {number} userId - ID do usuário.
     * @param {string} nome - Novo nome.
     * @param {string} bio - Nova bio.
     * @param {string} profile_img_url - URL da nova imagem de perfil.
     */
    async atualizarPerfil(userId, nome, bio, profile_img_url) {
        const {rowCount} = await runQuery("update_user_profile", [nome, bio, profile_img_url, userId]);

        if (rowCount === 0) {
            throw new Error("Usuário não encontrado ou nenhuma alteração feita.");
        }
    }

    async deletarTokenResetPass(token) {
        await runQuery("delete_token_reset_pass_by_token", [token]);
    }

    async getProfileImg(userId) {
        return await runQuery("select_user_profile_img_by_id", [userId]);
    }

    async updateProfileImg(imagePath, userId) {
        return await runQuery("update_user_profile_img_by_id", [imagePath, userId]);
    }

}

// Exporta classe UserService
module.exports = UserService;
