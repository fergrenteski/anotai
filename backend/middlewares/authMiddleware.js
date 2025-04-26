// Importa bibliotecas e funçöes:
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

    // Extrai Authorization da requisição.
    const authHeader = req.headers["authorization"];

    // Se não existir o header, responde com erro.
    if (!authHeader) return res.status(400).json({message: "Token não fornecido ou mal formatado." });

     // Retira o "Bearer" no começo do token
    const token = authHeader.split(" ")[1];

    try {

        // Verifica o token usando a chave secreta
        const decoded = jwt.verify(token, JWT_SECRET);

        // Adiciona o payload do token na requisição para uso posterior
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({message: "Token inválido ou expirado." });
    }
}
// Exporta o middleware
module.exports = verificarToken;