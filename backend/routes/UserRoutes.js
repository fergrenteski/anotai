const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();

router.post("/cadastro", UserController.cadastro);
router.post("/login", UserController.login);
router.get("/verificar-token", UserController.verificarToken);
router.post("/redefinir-senha", UserController.redefinirSenha)

module.exports = router;
