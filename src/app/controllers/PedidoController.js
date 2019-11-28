const { formatToTimeZone } = require("date-fns-timezone");

const getHours = require("date-fns/getHours");

const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");

const User = require("../models/User");

class PedidoController {
  async index(req, res) {
    const filters = {};
    if (req.query.data_min || req.query.data_max) {
      filters.createdAt = {};

      const dataMinFormatada = formatToTimeZone(
        req.query.data_min,
        "YYYY-MM-DDT00:mm:ss.SSSZ", // formatação de data e hora
        {
          timeZone: "America/Sao_Paulo"
        }
      );

      const dataMaxFormatada = formatToTimeZone(
        req.query.data_max,
        "YYYY-MM-DDT23:59:ss.SSSZ", // formatação de data e hora
        {
          timeZone: "America/Sao_Paulo"
        }
      );

      filters.createdAt.$gte = dataMinFormatada;
      filters.createdAt.$lte = dataMaxFormatada;
    }

    const userLogado = await User.findById(req.userId);

    // se não for um provedor
    if (userLogado.provedor !== true) {
      const pedidos = await Pedido.find({
        cliente: req.userId
      }).populate("cliente");

      return res.json(pedidos);
    }

    const pedidos = await Pedido.paginate(filters, {
      page: req.params.id,
      limit: 10,
      populate: ["cliente"],
      sort: "-createdAt"
    });

    return res.json(pedidos);
  }

  async store(req, res) {
    const produto = await Produto.findById(req.body.produto);
    const hora = getHours(new Date(Date.now())); //pega o número da hora

    if (hora < 8 || hora >= 18) {
      return res.status(400).json({
        mensagem:
          "Ops, os pedidos só podem ser feitos das 08:00 da manhã ás 18:00 da tarde"
      });
    }
    if (produto.quantidade <= 0) {
      return res.status(400).json({
        mensagem:
          "Ops, felizmente vendemos todo o nosso estoque e o produto desejado esta indisponível. Tente novamente mais tarde."
      });
    }
    if (produto.quantidade < req.body.quantidade) {
      return res.status(400).json({
        mensagem:
          "Ops, a quantidade pedida é maior do que temos disponível no momento."
      });
    }

    const pedido = await Pedido.create({
      ...req.body,
      cliente: req.userId,
      valorTotal: produto.preco * req.body.quantidade
    });

    produto.quantidade -= req.body.quantidade;
    await produto.save();

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
      return res.status(400).json({
        mensagem: "Você não tem permissão para alterar este pedido."
      });
    }

    const valorQuantidadeUpdate =
      pedidoExistente.quantidade - req.body.quantidade;

    // Condição para alterar a quantidade do produto em estoque com base na alteração da quantidade do pedido
    if (valorQuantidadeUpdate < 0) {
      const quantidade = valorQuantidadeUpdate * -1; // formata para um número positivo
      produto.quantidade -= quantidade;
    } else {
      const quantidade = valorQuantidadeUpdate;
      produto.quantidade += quantidade;
    }

    const pedido = await Pedido.findByIdAndUpdate(req.params.id, req.body, {
      valorTotal: produto.preco * req.body.quantidade,
      new: true
    });

    pedido.valorTotal = produto.preco * req.body.quantidade;

    await produto.save(); // atualiza as alterações feitas no produto
    await pedido.save(); // atualiza as alterações feitas no pedido

    return res.json(pedido);
  }

  async show(req, res) {
    const userLogado = await User.findById(req.userId);
    const pedidoExistente = await Pedido.findById(req.params.id);

    //condição para saber se o usuário logado é o autor do pedido ao é um provedor
    if (
      String(userLogado._id) !== String(pedidoExistente.cliente) &&
      userLogado.provedor !== true
    ) {
      return res.status(400).json({
        mensagem: "Você não tem permissão para alterar este pedido."
      });
    }
    const pedido = await Pedido.findById(req.params.id)
      .populate("produto")
      .populate("cliente");

    return res.json(pedido);
  }

  async destroy(req, res) {
    const userLogado = await User.findById(req.userId);
    const pedidoExistente = await Pedido.findById(req.params.id);

    //condição para saber se o usuário logado é o autor do pedido ao é um provedor
    if (
      String(userLogado._id) !== String(pedidoExistente.cliente) &&
      userLogado.provedor !== true
    ) {
      return res.status(400).json({
        mensagem: "Você não tem permissão para excluir este pedido."
      });
    }
    await Pedido.findByIdAndDelete(req.params.id);

    return res.json();
  }
}

module.exports = new PedidoController();
