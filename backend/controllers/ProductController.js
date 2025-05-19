
const ProductService = require("../services/ProductService");

class ProductController {
    constructor() {
        this.productService = new ProductService();
    }

    async create(req, res){

        console.log(req.body);

        const {name, description} = req.body;
        const added_by = req.usuario.id;
        const category_id = 1;

        console.log (added_by);

        const {rows} = await this.productService.create(name, description, category_id);
    }

    async getProductList(req, res){
        const idList = 1;

        const {rows} = await this.productService.getProductList(idList);
        console.log(rows);
        return res.status(200).json({success: true, data: rows});
    }
}

module.exports = new ProductController();