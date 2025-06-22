// database/config.js
module.exports = {
    user: process.env.POSTGRES_USER,      // Usuário do banco
    host: process.env.DB_HOST,      // Host (endereço do servidor do banco)
    database: process.env.POSTGRES_DB,  // Nome do banco de dados
    password: process.env.POSTGRES_PASSWORD, // Senha do banco
    port: process.env.DB_PORT,
};
