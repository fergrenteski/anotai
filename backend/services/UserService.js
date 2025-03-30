const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");
// Importa queries de um arquivo centralizado
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "1h"; // Tempo de expiração do token
const SALT_ROUNDS = 10; // Quantidade de rounds para o bcrypt

class UserService {

    async cadastrarUsuario(nome, email, senha) {
        const queries = await loadQueries();
        const existe = await pool.query(queries.select_user_by_email, [email]);

        if (existe.rows.length > 0) {
            throw new Error("E-mail já cadastrado!");
        }

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const senhaHash = await bcrypt.hash(senha, salt);

        const result = await pool.query(queries.insert_user, [nome, email, senhaHash]);

        const token = this.gerarToken(result.rows[0]);

        // Registra o log de cadastro
        await this.registrarLog(queries.insert_user_log_register, [result.rows[0].user_id]);

        return { message: "Cadastro realizado com sucesso!", token };
    }

    async loginUsuario(email, senha) {
        const queries = await loadQueries();
        const usuario = await pool.query(queries.select_user_by_email, [email]);

        if (usuario.rows.length === 0) {
            throw new Error("E-mail ou senha inválidos!");
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.rows[0].senha);

        if (!senhaCorreta) {
            throw new Error("E-mail ou senha inválidos!");
        }

        const token = this.gerarToken(usuario.rows[0]);

        // Registra o log de login
        await this.registrarLog(queries.insert_user_log_login, [usuario.rows[0].user_id]);

        return { message: "Login realizado com sucesso!", token };
    }

    gerarToken(usuario) {
        return jwt.sign(
            { id: usuario.id, nome: usuario.nome, email: usuario.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );
    }

    async verificarToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return { valid: true, nome: decoded.nome };
        } catch (err) {
            throw new Error("Token inválido");
        }
    }

    async registrarLog(query, params) {
        await pool.query(query, params);
    }
}

module.exports = UserService;
