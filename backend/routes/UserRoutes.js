const express = require("express");
const UserController = require("../controllers/UserController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();

router.post("/cadastro", (req, res) => UserController.cadastro(req, res));
router.post("/login", (req, res) => UserController.login(req, res));
router.get("/verificar-token", verificarToken, (req, res) =>  UserController.verificarToken(req, res));
router.post("/redefinir-senha", (req, res) => UserController.redefinirSenha(req, res));
router.post("/confirmar-email", (req, res) => UserController.confirmarEmail(req, res));
router.post("/alterar-senha", (req, res) => UserController.alterarSenha(req, res));

module.exports = router;
