const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

async function loadQueries() {
    try {
        const filePath = path.join(__dirname, '../queries', 'queries.yaml');
        const fileContent = await fs.promises.readFile(filePath, 'utf8'); // Lê o arquivo de forma assíncrona
        return yaml.load(fileContent).queries;
    } catch (error) {
        console.error("Erro ao ler o arquivo YAML:", error); // Log em caso de erro
        return null; // Retorna null se houver erro
    }
}

module.exports = { loadQueries };