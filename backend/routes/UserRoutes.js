// Importa bibliotecas e funçöes:
const express = require("express");
const UserController = require("../controllers/UserController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();

/**
Entendimento geral das rotas do usuário:
> Definição da URL
>> @verificarToken valida o JWT do usuário (garante que esteja autenticado). Se o token for inválido, a requisição é bloqueada aqui
* @param req - Objeto de requisição HTTP.
* @param res - Objeto de resposta HTTP.
*/

// Rota de cadastro do usuário
router.post("/cadastro", (req, res) => UserController.cadastro(req, res));

// Rota de login do usuário
router.post("/login", (req, res) => UserController.login(req, res));

// Rota de verificação do token
router.get("/verificar-token", verificarToken, (req, res) =>  UserController.verificarToken(req, res));

// Rota de redifinir a senha do usuário
router.post("/redefinir-senha", (req, res) => UserController.redefinirSenha(req, res));

// Rota de confirmar email do usuário
router.post("/confirmar-email", (req, res) => UserController.confirmarEmail(req, res));

// Rota de alterar senha do usuário
router.post("/alterar-senha", (req, res) => UserController.alterarSenha(req, res));
router.post("/reconfirmar-email/:email", (req, res) => UserController.reconfirmarEmail(req, res));

// Exporta classe  router
module.exports = router;
