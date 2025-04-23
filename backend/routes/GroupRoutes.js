const express = require("express");
const GroupController = require("../controllers/GroupController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();

router.get("/", verificarToken, (req, res) => GroupController.getAll(req, res));
router.get("/:id", verificarToken, (req, res) => GroupController.getById(req, res));
router.post("/", verificarToken, (req, res) => GroupController.create(req, res));
router.delete("/:id", verificarToken, (req, res) => GroupController.delete(req, res));
router.get("/group_types", verificarToken, (req, res) => GroupController.getCategories(req, res));
router.get("/:id/members", verificarToken, (req, res) => GroupController.getMembers(req, res));

module.exports = router;
