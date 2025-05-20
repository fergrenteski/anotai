// Importa bibliotecas e funçöes:
const express = require("express");
const MemberController = require("../controllers/MemberController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();


// Rotas de Membros
router.get("/invites", verificarToken, (req, res) => MemberController.getAllinvites(req, res));

// Exporta classe  router
module.exports = router;