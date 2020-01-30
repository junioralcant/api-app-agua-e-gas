const { formatToTimeZone } = require("date-fns-timezone");

const getHours = require("date-fns/getHours");

const Pedido = require("../models/Pedido");
const Produto = require("../models/Produto");

const User = require("../models/User");

class PedidoController {
  async index(req, res) {
    const filters = {};

    if (req.query.nome) {
      filters.nomeCliente = new RegExp(req.query.nome, "i");
    }

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
      }).populate(["cliente", "produto"]);

      return res.json(pedidos);
    }

    const pedidos = await Pedido.paginate(filters, {
      page: req.query.page || 1,
      limit: 12,
      populate: ["cliente", "produto"],
      sort: "-createdAt"
    });

    return res.json(pedidos);
  }

  async store(req, res) {
    const produto = await Produto.findById(req.body.produto);
    const user = await User.findById(req.userId);
    const { endereco } = user;

    const hora = getHours(new Date(Date.now())); //pega o número da hora

    console.log(hora);

    // if (hora < 8 || hora >= 18) {
    //   return res.status(400).json({
    //     mensagem:
    //       "Ops, os pedidos só podem ser feitos das 08:00 da manhã ás 18:00 da tarde"
    //   });
    // }
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

    const enderecoEspecifico = endereco.find(
      end => String(end._id) === String(req.body.enderecoId)
    );

    const pedido = await Pedido.create({
      ...req.body,
      cliente: req.userId,
      nomeCliente: user.nome,
      enderecoEntrega: enderecoEspecifico,
      valorTotal: produto.preco * req.body.quantidade
    });

    produto.quantidade -= req.body.quantidade;
    await produto.save();

    req.io.emit("createPedido", {
      message: "Um novo pedido foi realizado"
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
    const produto = await Produto.findById(pedidoExistente.produto);

    //permite que apenas o provedor delete pedidos
    if (userLogado.provedor !== true) {
      return res.status(400).json({
        mensagem: "Você não tem permissão para excluir este pedido."
      });
    }

    await Pedido.findByIdAndDelete(req.params.id);

    // Atualização do produto em estoque
    produto.quantidade += pedidoExistente.quantidade;
    await produto.save(); // atualiza as alterações feitas no produto

    return res.json();
  }
}

module.exports = new PedidoController();
