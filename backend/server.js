require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("express");

const userRoutes = require("./routes/UserRoutes"); // Importa rotas de autenticação
const groupRoutes = require("./routes/GroupRoutes"); // Importa rotas de autenticação
const requestLoggerMiddleware = require("./middlewares/requestLoggerMiddleware"); // Importa o middleware de log de requisição
// Inicializa o aplicativo Express
const app = express();

// Configura middlewares
app.use(cors());
app.use(bodyParser.json());

// Aplica o middleware de log de requisição
app.use(requestLoggerMiddleware);

// Importa as rotas
app.use("/api/user", userRoutes);
app.use("/api/groups", groupRoutes);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
