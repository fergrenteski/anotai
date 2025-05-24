const CategoryService = require("../services/CategoryService");

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    /**
     * Função que retorna as categorias de Grupo
     */
    async getGroupsCategories(req, res) {
        try {

            // Obtem as categorias.
            const { rows } = await this.categoryService.getGroupsCategories();

            //Retorna os dados das categorias
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({ success: false, message: "Erro na Busca de Categorias" });
        }
    }

    /**
     * Função que retorna as categorias de Lista
     */
    async getListsCategories(req, res) {
        try {

            // Obtem as categorias.
            const { rows } = await this.categoryService.getListsCategories();

            //Retorna os dados das categorias
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({ success: false, message: "Erro na Busca de Categorias" });
        }
    }

    /**
     * Função que retorna as categorias de Produto
     */
    async getProductsCategories(req, res) {
        try {

            // Obtem as categorias.
            const { rows } = await this.categoryService.getProductsCategories();

            //Retorna os dados das categorias
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({ success: false, message: "Erro na Busca de Categorias" });
        }
    }
}

module.exports = new CategoryController();
