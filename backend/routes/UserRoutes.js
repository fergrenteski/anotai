// Importa bibliotecas e funçöes:
const express = require("express");
const UserController = require("../controllers/UserController");
const verificarToken = require("../middlewares/authMiddleware")
const path = require("path");
const multer = require("multer");
const UserControler = require("../controllers/UserController");
const router = express.Router();

const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.usuario?.id || 'unknown';
        const ext = path.extname(file.originalname).toLowerCase(); // ex: ".jpg"
        cb(null, `${userId}${ext}`); // ex: "123.png"
    }
});


const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.test(ext));
};

const upload = multer({ storage, fileFilter });


/**
 Entendimento geral das rotas do usuário:
 > Definição da URL
 >> @verificarToken valida o JWT do usuário (garante que esteja autenticado). Se o token for inválido, a requisição é bloqueada aqui
 * @param req - Objeto de requisição HTTP.
 * @param res - Objeto de resposta HTTP.
 */
// Rota com ID para permitir uso no multer e controller
router.put('/profile-image', verificarToken, upload.single('image'), (req, res) => UserControler.uploadProfileImage(req, res));

router.delete('/profile-image', verificarToken, (req, res) => UserControler.deleteProfileImage(req,res));

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

router.post("/perfil", verificarToken, (req, res) => UserController.atualizarPerfil(req, res));

router.post("/alterar-senha", verificarToken, (req, res) => UserController.alterarSenhaAutenticado(req, res));

// Exporta classe  router
module.exports = router;
