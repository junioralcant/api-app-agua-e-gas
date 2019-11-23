const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");

const User = require("../models/User");

class PedidoController {
  async index(req, res) {
    const pedidos = await Pedido.find({ cliente: req.userId }).populate(
      "cliente"
    );

    return res.json(pedidos);
  }

  async store(req, res) {
    const produto = await Produto.findById(req.body.produto);
    const pedido = await Pedido.create({
      ...req.body,
      cliente: req.userId,
      valorTotal: produto.preco * req.body.quantidade
    });

    return res.json(pedido);
  }

  async update(req, res) {
    const produto = await Produto.findById(req.body.produto);
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, {
      valorTotal: produto.preco * req.body.quantidade,
      new: true
    });

    pedido.valorTotal = produto.preco * req.body.quantidade;

    await pedido.save(); // atualiza o valor total do pedido
    return res.json(pedido);
  }

  async show(req, res) {
    const pedido = await Pedido.findById(req.params.id)
      .populate("produto")
      .populate("cliente");

    return res.json(pedido);
  }

  async destroy(req, res) {
    await Pedido.findByIdAndDelete(req.params.id);

    return res.json();
  }
}

module.exports = new PedidoController();
