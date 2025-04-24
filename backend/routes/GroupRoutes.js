const express = require("express");
const GroupController = require("../controllers/GroupController");
const CategoryController = require("../controllers/CategoryController");
const MemberController = require("../controllers/MemberController");
const ListController = require("../controllers/ListController");
const ProductController = require("../controllers/ProductController");
const verificarToken = require("../middlewares/authMiddleware")
const router = express.Router();

// Rotas de Categorias de Grupo
router.get("/categories", verificarToken, (req, res) => CategoryController.getAll(req, res));

// Rotas de Grupo
router.get("/", verificarToken, (req, res) => GroupController.getAll(req, res));
router.post("/", verificarToken, (req, res) => GroupController.create(req, res));
router.get("/:groupId", verificarToken, (req, res) => GroupController.getById(req, res));
router.put("/:groupId", verificarToken, (req, res) => GroupController.update(req, res));
router.delete("/:groupId", verificarToken, (req, res) => GroupController.delete(req, res));

// Rotas de Membros de grupo
router.get("/:groupId/members", verificarToken, (req, res) => MemberController.getAll(req, res));
router.post("/:groupId/members", verificarToken, (req, res) => MemberController.create(req, res));
router.delete("/:groupId/members/:memberId", verificarToken, (req, res) => MemberController.delete(req, res));

// Rotas de Lista de compras
router.get("/:groupId/lists", verificarToken, (req, res) => ListController.getAll(req, res));
router.post("/:groupId/lists", verificarToken, (req, res) => ListController.create(req, res));
router.get("/:groupId/lists/:listId", verificarToken, (req, res) => ListController.getById(req, res));
router.put("/:groupId/lists/:listId", verificarToken, (req, res) => ListController.update(req, res));
router.delete("/:groupId/lists/:listId", verificarToken, (req, res) => ListController.delete(req, res));

// Rotas de produtos
router.get("/:groupId/lists/:listId/products", verificarToken, (req, res) => ProductController.getAll(req, res));
router.post("/:groupId/lists/:listId/products", verificarToken, (req, res) => ProductController.create(req, res));
router.get("/:groupId/lists/:listId/products/:productId", verificarToken, (req, res) => ProductController.getById(req, res));
router.put("/:groupId/lists/:listId/products/:productId", verificarToken, (req, res) => ProductController.update(req, res));
router.delete("/:groupId/lists/:listId/products/:productId", verificarToken, (req, res) => ProductController.delete(req, res));

module.exports = router;
