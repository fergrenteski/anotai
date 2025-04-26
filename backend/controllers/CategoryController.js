// Importa bibliotecas e funçöes:
const CategoryService = require("../services/CategoryService");

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    /**
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     */
    async getAll(req, res) {
        try {
            const { rows } = await this.categoryService.getAll();
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Erro na Busca de Categorias:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CategoryController();
