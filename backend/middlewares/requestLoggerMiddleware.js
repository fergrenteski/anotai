const pool = require("../database/database");
const { loadQueries } = require("../utils/queries");// Caminho para o seu arquivo de conexão com o banco de dados

// Middleware para log de requisição
const requestLoggerMiddleware = async (req, res, next) => {
    // Carrega as queries do arquivo YAML de forma assíncrona
    const queries = await loadQueries(); // Carrega as queries de forma assíncrona

    if (queries) {
        // Quando a requisição é processada e a resposta é enviada, registramos o log
        res.on("finish", async () => {
            const { method, originalUrl } = req; // Metodo e URL da requisição
            const status_code = res.statusCode; // Código de status da resposta
            const ip_address = req.ip || req.connection.remoteAddress; // IP do cliente
            const user_agent = req.headers["user-agent"]; // Agente de usuário (navegador e SO)

            try {
                // Registra o log da requisição no banco de dados
                await pool.query(queries.insert_request_log, [
                    method,
                    originalUrl,
                    status_code,
                    ip_address,
                    user_agent
                ]);
            } catch (error) {
                console.error("Erro ao registrar log de requisição:", error);
            }
        });
    }

    // Passa a requisição para o próximo middleware ou rota
    next();
};

module.exports = requestLoggerMiddleware;
