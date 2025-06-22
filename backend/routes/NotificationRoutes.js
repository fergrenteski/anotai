// Importa bibliotecas e funçöes:
const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();


// Rotas de Notificação
router.get("/", verificarToken, (req , res) => NotificationController.getAll(req, res));

// Marcar como lido
router.put("/", verificarToken, (req , res) => NotificationController.markAllAsRead(req, res));
router.put("/:id", verificarToken, (req , res) => NotificationController.markAsRead(req, res));

// Excluir notificação
router.delete("/", verificarToken, (req , res) => NotificationController.deleteAll(req, res));
router.delete("/:id", verificarToken, (req , res) => NotificationController.delete(req, res));

// Exporta classe  router
module.exports = router;