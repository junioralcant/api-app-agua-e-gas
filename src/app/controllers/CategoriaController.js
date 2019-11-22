const Categoria = require("../models/Categoria");

class CategoriaController {
  async index(req, res) {
    const categoria = await Categoria.paginate();

    return res.json(categoria);
  }

  async store(req, res) {
    const categoria = await Categoria.create(req.body);

    return res.json(categoria);
  }

  async update(req, res) {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json(categoria);
  }

  async show(req, res) {
    const categoria = await Categoria.findById(req.params.id);

    return res.json(categoria);
  }

  async destroy(req, resp) {
    await Categoria.findByIdAndDelete(req.params.id);

    return resp.send();
  }
}

module.exports = new CategoriaController();
