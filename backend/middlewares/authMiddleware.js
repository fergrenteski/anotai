const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para autenticação via JWT.
 * Verifica o token no cabeçalho Authorization e decodifica as informações do usuário.
 *
 * @param {import("express").Request} req - Objeto da requisição.
 * @param {import("express").Response} res - Objeto da resposta.
 * @param {import("express").NextFunction} next - Função para chamar o próximo middleware.
 */
function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Token não fornecido ou mal formatado." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Adiciona o payload do token na requisição para uso posterior
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token inválido ou expirado." });
    }
}

module.exports = verificarToken;
