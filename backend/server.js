require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const path = require('path');

const userRoutes = require("./routes/UserRoutes");
const groupRoutes = require("./routes/GroupRoutes");
const memberRoutes = require("./routes/MemberRoutes");
const requestLoggerMiddleware = require("./middlewares/requestLoggerMiddleware");
const {setupWebSocket} = require("./webSocket");

const app = express();

// Middlewares do Express
app.use(cors());
app.use(express.json({ limit: '80mb' }));
app.use(requestLoggerMiddleware);

app.use("/api/user", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/member", memberRoutes);
app.use('/api/profile', express.static(path.join(__dirname, 'uploads', 'profiles')));

const server = http.createServer(app);
setupWebSocket(server);

// Inicia o servidor HTTP e WebSocket juntos
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
