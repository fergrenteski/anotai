const { loadQueries } = require("./queries");
const pool = require("../database/database");

/**
 * Executa uma query SQL com base nas queries carregadas.
 * @param {string} queryKey Chave da query no arquivo de queries
 * @param {Array<any>} params Parâmetros da query
 * @returns {Promise<{rows: any[]}>}
 */
async function runQuery(queryKey, params = []) {
    const queries = await loadQueries();

    if (!queries) {
        throw new Error("Falha ao carregar queries do YAML.");
    }

    console.log("Queries carregadas:", Object.keys(queries));

    const query = queries[queryKey];

    if (!query) {
        throw new Error(`Query com a chave "${queryKey}" não encontrada no YAML.`);
    }

    try {
        const { rows } = await pool.query(query, params);
        return { rows };
    } catch (error) {
        console.error(`Erro ao executar a query "${queryKey}":`, error);
        throw new Error(`Erro na execução da query: ${error.message}`);
    }
}

module.exports = { runQuery };
