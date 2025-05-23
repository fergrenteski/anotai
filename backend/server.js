require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("express");

const userRoutes = require("./routes/UserRoutes"); // Importa rotas de Usuário
const groupRoutes = require("./routes/GroupRoutes"); // Importa rotas de Grupo
const memberRoutes = require("./routes/MemberRoutes"); // Importa rotas de Grupo
const requestLoggerMiddleware = require("./middlewares/requestLoggerMiddleware"); // Importa o middleware de log de requisição
// Inicializa o aplicativo Express
const app = express();

// Configura middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '80mb' }));


// Aplica o middleware de log de requisição
app.use(requestLoggerMiddleware);

// Importa as rotas
app.use("/api/user", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/member", memberRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

