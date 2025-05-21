// Importa bibliotecas e funçöes:
const express = require("express");
const MemberController = require("../controllers/MemberController");
const verificarToken = require("../middlewares/authMiddleware")
const ProductController = require("../controllers/ProductController");
const router = express.Router();


// Rotas de Membros
router.get("/invites", verificarToken, (req, res) => MemberController.getAllinvites(req, res));

// Rotas de produtos
router.get("/lists/:listid/users/:userid/products", (req , res) => ProductController.getProductsByUserId(req, res));

// Exporta classe  router
module.exports = router;