
const ProductService = require("../services/ProductService");

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    async create(req, res){

        const {name, description, categoryId, listId} = req.body;
        const addedBy = req.usuario.id;
        try {
            await this.productService.create(name, description, categoryId, addedBy, listId);

            return res.status(201).json({ success: true , message: "Produto Adicionado com sucesso"});
        } catch (error) {
            console.error("Erro ao criar produto", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAll(req, res){

        const { listId } = req.params;

        try {
            const rows = await this.productService.getAll(listId);

            return res.status(200).json({success: true, data: rows, user: req.usuario});
        } catch (error) {
            console.error("Erro ao buscar produtos", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async delete(req, res){

        const { productId } = req.params;

        try{

            console.log("Entrei no delete");
            const rows = await this.productService.delete(productId);
            return res.status(200).json({success: true, data: rows});

        }catch(error){
            console.error("Erro ao deletar produto", error);
            return res.status(500).json({ success: false, message: error.message });
        }

    }
}

module.exports = new ProductController();