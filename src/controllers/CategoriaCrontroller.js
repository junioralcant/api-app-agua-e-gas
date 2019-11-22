const Categoria = require("../models/Categoria");

class CategoriaController {
  async store(req, res) {
    const categoria = await Categoria.create(req.body);

    return res.json(categoria);
  }
}

module.exports = new CategoriaController();
