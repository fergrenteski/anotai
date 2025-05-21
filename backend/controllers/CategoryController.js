// Importa bibliotecas e funçöes:
const CategoryService = require("../services/CategoryService");

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    /**
     * Método assíncrono que retorna todas as categorias do sistema.
     * @param req - Objeto de requisição HTTP.
     * @param res - Objeto de resposta HTTP.
     * @returns {Promise<*>} - Retorna uma resposta JSON com as categorias ou erro.
     */
    async getAll(req, res) {
        try {

            // Obitem as categorias.
            const { rows } = await this.categoryService.getAll();

            //Retorna os dados das categorias
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAllProducts(req, res) {

        console.log("Entrei no getAllProducts");

        try {
            const {rows} = await this.categoryService.getAllProducts();
            return res.status(200).json({success: true, data: rows});
        }
        catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }
}
// Exporta o CategoryController
module.exports = new CategoryController();
