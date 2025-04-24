// Importa o módulo dotenv para carregar variáveis de ambiente do arquivo .env
require("dotenv").config();

// Importa o módulo pg (node-postgres) para conectar ao PostgreSQL
const { Pool } = require("pg");

// Cria um pool de conexões com o banco de dados, usando as configurações do .env
const pool = new Pool({
    user: process.env.POSTGRES_USER,      // Usuário do banco
    host: process.env.DB_HOST,      // Host (endereço do servidor do banco)
    database: process.env.POSTGRES_DB,  // Nome do banco de dados
    password: process.env.POSTGRES_PASSWORD, // Senha do banco
    port: process.env.DB_PORT,      // Porta do banco (padrão 5432)
});

// Exporta o pool para ser usado em outros arquivos
module.exports = pool;
