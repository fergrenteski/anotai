// Importa bibliotecas e funçöes:
const { runQuery } = require("../utils/queryHelper");

/**
 * Middleware para verificar se o usuário autenticado possui acesso ao grupo.
 * Extrai userId do token e groupId dos parâmetros da rota,
 * consulta o vínculo na tabela group_users e libera ou nega acesso.
 *
 * @param {import("express").Request} req - Objeto da requisição.
 * @param {import("express").Response} res - Objeto da resposta.
 * @param {import("express").NextFunction} next - Função para chamar o próximo middleware.
 */

const verificarAcessoGrupo = async (req, res, next) => {
    
    // Obtém ID do usuário e ID do grupo da rota
    const userId = req.usuario.id;
    const { groupId } = req.params;

    try {
        
        // Executa query que verifica associação ativa do usuário no grupo
        const { rows } = await runQuery("select_user_group_member", [userId, groupId]);
        
        // Se não existir, nega acesso com 401
        if (rows.length === 0) return res.status(401).json({ success: false, message: "Acesso negado: você não pertence a este grupo." });

        next();
    } catch (error) {
        console.error("Erro ao verificar participação no grupo:", error);
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};
// Exporta o middleware
module.exports = verificarAcessoGrupo;
