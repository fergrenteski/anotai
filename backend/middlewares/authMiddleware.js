const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para autenticação via JWT.
 * Verifica o token no cabeçalho Authorization e decodifica as informações do usuário.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ success: false, message: "Token não fornecido." });
    }

    // Verifica se o header tem o formato correto: "Bearer <token>"
    const partes = authHeader.split(" ");
    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({ success: false, message: "Token mal formatado." });
    }

    const token = partes[1];

    try {
        req.usuario = jwt.verify(token, JWT_SECRET); // adiciona dados do token na req
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Sessão expirada ou não autorizada. Redirecionando para login..." });
    }
}

module.exports = verificarToken;