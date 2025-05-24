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
                    userId: row.user_id,
                    name: row.purchased_name,
                    userEmail: row.user_email,
                    amount: parseFloat(row.total_gasto)
                };
            });

            // Retorna os dados formatados
            return res.status(200).json({
                success: true,
                totalByCategory: Object.values(totalByCategory),
                categorySpendingByUser: Object.values(categorySpendingByUser),
                totalSpendingByUser: Object.values(totalSpendingByUser)
            });

        } catch (error) {
            console.error("Erro ao buscar insights da lista:", error);
            return res.status(500).json({ success: false, message: "Erro ao buscar insights da lista"});
        }
    }

    async getProductsByUserId(req, res) {

        const listId = req.params.listid;
        const userId = req.params.userid;

        if (!listId || !userId) return res.status(404).json({success: false, message: "Parametros incorretos"});

        try {
            const {rows} = await this.productService.getProductsByUserId(listId, userId);
            return res.status(200).json({success: true, data: rows});
        } catch (error) {
            console.error("Erro ao buscar produtos do usuário:", error);
            return res.status(500).json({success: false, message: error.message});
        }

    }

    async create(req, res) {

        const {name, description, categoryId, quantity, listId} = req.body;
        const addedBy = req.usuario.id;
        try {
            await this.productService.create(name, description, categoryId, addedBy, quantity, listId);
            return res.status(201).json({success: true, message: "Produto Adicionado com sucesso"});
        } catch (error) {
            console.error("Erro ao criar produto", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }

    async update(req, res) {

        const {name, description, categoryId, quantity} = req.body;
        const {productId} = req.params;

        try {
            await this.productService.update(productId, name, description, categoryId, quantity);
            return res.status(200).json({success: true, message: "Produto Atualizado com sucesso"});
        } catch (error) {
            console.error("Erro ao atualizar produto", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }

    async getAll(req, res) {

        const {listId} = req.params;

        try {
            const {rows} = await this.productService.getAll(listId);
            return res.status(200).json({success: true, data: rows, user: req.usuario});
        } catch (error) {
            console.error("Erro ao buscar produtos", error);
            return res.status(500).json({success: false, message: "Erro ao buscar produtos"});
        }
    }

    async delete(req, res) {

        const {productId} = req.params;

        try {
            await this.productService.delete(productId);
            return res.status(200).json({success: true, message: "Produto Deletado com sucesso"});
        } catch (error) {
            console.error("Erro ao deletar produto", error);
            return res.status(500).json({success: false, message: "Erro ao deletar produto"});
        }
    }

    async updateBuy(req, res) {

        const buyBy = req.usuario.id;
        const {productId, option} = req.params;
        const { price } = req.body;

        if (option !== 'sell' && option !== 'buy') return res.status(401).json({
            success: false,
            message: "Rota Inválida"
        });

        const buy = option === 'buy';

        try {

            await this.productService.updateBuy(buy ? buyBy : null, buy ? price : null, productId);
            return res.status(200).json({
                success: true,
                message: `Produto ${buy ? 'Comprado' : 'Revertido'} com sucesso`
            });

        } catch (error) {
            console.error("Erro ao atualizar o estado do produto", error);
            return res.status(500).json({success: false, message: "Erro ao atualizar o estado do produto"});
        }
    }

    async getById(req, res) {

        const {productId} = req.params;

        try {
            const rows = await this.productService.getById(productId);
            return res.status(200).json({success: true, data: rows, message: "Produto encontrado"});
        } catch (error) {
            console.error("Erro ao buscar produto", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }
}

module.exports = new ProductController();
