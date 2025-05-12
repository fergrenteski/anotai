const ProductService = require("../services/ProductService");

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    /**
     * Retorna insights de uma lista de compras específica, incluindo:
     * - Total gasto por categoria
     * - Total gasto por usuário
     * - Detalhamento do gasto por categoria por usuário
     *
     * @param {import("express").Request} req - Requisição HTTP com token JWT decodificado (req.usuario).
     * @param {import("express").Response} res - Resposta HTTP.
     * @returns {Promise<import("express").Response>}
     */
    async getInsights(req, res) {
        try {
            const listId = req.params.listId;

            // Consulta o total gasto por categoria
            const totalByCategoryResult = await this.productService.getTotalCategories(listId);

            // Consulta o detalhamento do gasto por categoria por usuário
            const categoryBreakdownPerUserResult = await this.productService.getTopCategoriesByUsers(listId);

            // Consulta o total gasto por usuário
            const totalByUserResult = await this.productService.getTotalByUsers(listId);

            // Formata o total gasto por categoria
            const totalByCategory = totalByCategoryResult.rows;

            // Monta estrutura com os gastos por categoria por usuário
            const categorySpendingByUser = {};

            categoryBreakdownPerUserResult.rows.forEach(row => {
                const {
                    user_id,
                    purchased_name,
                    category_id,
                    category_name,
                    total_categoria_usuario
                } = row;

                if (!categorySpendingByUser[user_id]) {
                    categorySpendingByUser[user_id] = {
                        name: purchased_name,
                        categories: {}
                    };
                }

                categorySpendingByUser[user_id].categories[category_id] = {
                    name: category_name,
                    amount: parseFloat(total_categoria_usuario)
                };
            });

            // Monta estrutura com o total gasto por usuário
            const totalSpendingByUser = {};

            totalByUserResult.rows.forEach(row => {
                totalSpendingByUser[row.user_id] = {
                    name: row.purchased_name,
                    amount: parseFloat(row.total_gasto)
                };
            });

            // Retorna os dados formatados
            return res.status(200).json({
                success: true,
                totalByCategory,
                categorySpendingByUser,
                totalSpendingByUser
            });

        } catch (error) {
            console.error("Erro ao buscar insights da lista:", error);
            return res.status(500).json({
                success: false,
                message: "Erro ao buscar insights da lista"
            });
        }
    }
}

module.exports = new ProductController();
