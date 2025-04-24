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
    const { rows } = await pool.query(queries[queryKey], params);
    return { rows };
}

module.exports = { runQuery };
