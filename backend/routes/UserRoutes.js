const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();

router.post("/cadastro", (req, res) => UserController.cadastro(req, res));
router.post("/login", (req, res) => UserController.login(req, res));
router.get("/verificar-token", (req, res) =>  UserController.verificarToken(req, res));
router.post("/redefinir-senha", (req, res) => UserController.redefinirSenha(req, res));
router.post("/confirmar-email", (req, res) => UserController.confirmarEmail(req, res));

module.exports = router;
