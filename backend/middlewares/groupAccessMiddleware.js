const { runQuery } = require("../utils/queryHelper");

const verificarAcessoGrupo = async (req, res, next) => {
    const userId = req.usuario.id;
    const { groupId } = req.params;

    try {
        const { rows } = await runQuery("select_user_group_member", [userId, groupId]);

        if (rows.length === 0) return res.status(401).json({ success: false, message: "Acesso negado: você não pertence a este grupo." });

        next();
    } catch (error) {
        console.error("Erro ao verificar participação no grupo:", error);
        return res.status(500).json({ success: false, message: "Erro interno do servidor." });
    }
};

module.exports = verificarAcessoGrupo;
