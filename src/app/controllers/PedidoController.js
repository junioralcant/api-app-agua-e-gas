const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");

const User = require("../models/User");

class PedidoController {
  async index(req, res) {
    const userLogado = await User.findById(req.userId);

    // se não for um provedor
    if (userLogado.provedor !== true) {
      const pedidos = await Pedido.find({
        cliente: req.userId
      }).populate("cliente");

      return res.json(pedidos);
    }

    const pedidos = await Pedido.find().populate("cliente");

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
    const userLogado = await User.findById(req.userId);
    const produto = await Produto.findById(req.body.produto);
    const pedidoExistente = await Pedido.findById(req.params.id);

    // validação para ver se o usuário logado fez o pedido ou é um provedor
    if (
      String(userLogado._id) !== String(pedidoExistente.cliente) &&
      userLogado.provedor !== true
    ) {
      return res.json({
        messagem: "Você não tem permissão para alterar este pedido"
      });
    }

    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, {
      valorTotal: produto.preco * req.body.quantidade,
      new: true
    });

    pedido.valorTotal = produto.preco * req.body.quantidade;

    await pedido.save(); // atualiza o valor total do pedido
    return res.json(pedido);
  }

  async show(req, res) {
    const userLogado = await User.findById(req.userId);

    if (!userLogado) {
      return res.json({
        mensagem: "Você não tem permissão para alterar esse pedido"
      });
    }

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
