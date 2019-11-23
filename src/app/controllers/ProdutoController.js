const Produto = require("../models/Produto");
const User = require("../models/User");

class ProdutoController {
  async index(req, res) {
    const produtos = await Produto.paginate(null, {
      page: req.query.page || 1,
      limit: 10,
      populate: ["categoria"],
      sort: "-createdAt"
    });
    console.log(produtos);

    return res.json(produtos);
  }

  async store(req, res) {
    const produto = await Produto.create(req.body);

    return res.json(produto);
  }

  async show(req, res) {
    const produto = await Produto.findById(req.params.id);

    return res.json(produto);
  }

  async update(req, res) {
    const produto = await Produto.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    return res.json(produto);
  }

  async destroy(req, res) {
    await Produto.findByIdAndDelete(req.params.id);

    return res.send();
  }
}

module.exports = new ProdutoController();
