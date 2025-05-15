

async function create(req, res) {

    // Abstraí os dados da requisição
    const { name, description, quantity, price} = req.body;
    console.log(name, description, quantity, price);
}
module.exports = { create };