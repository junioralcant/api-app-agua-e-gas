// const Cliente = require("../models/Cliente");
// const User = require("../models/User");

// class ClienteController {
//   async index(req, resp) {
//     const filters = {};
//     if (req.query.nome) {
//       filters.nome = new RegExp(req.query.nome, "i");
//     }

//     if (req.query.cpf) {
//       filters.cpf = new RegExp(req.query.cpf, "i");
//     }

//     if (req.query.rg) {
//       filters.rg = new RegExp(req.query.rg, "i");
//     }
//     const clientes = await Cliente.paginate(filters, {
//       page: req.query.page || 1,
//       limit: 10,
//       sort: "-createdAt"
//     });

//     return resp.json(clientes);
//   }

//   async store(req, resp) {
//     const usuarioLogado = await User.findById(req.userId);

//     const CpfExists = await Cliente.findOne({ cpf: req.body.cpf }); // verifica se o CPF informado já existe no bd

//     if (CpfExists) {
//       return resp.status(400).json({ error: "Número de CPF já cadastrado." });
//     }

//     const RgExists = await Cliente.findOne({ rg: req.body.rg }); // verifica se o RG informado já existe no bd

//     if (RgExists) {
//       return resp.status(400).json({ error: "Número de RG já cadastrado." });
//     }

//     const cliente = await Cliente.create({
//       ...req.body,
//       usuario: usuarioLogado.nome
//     });

//     return resp.json(cliente);
//   }

//   async show(req, resp) {
//     const cliente = await Cliente.findById(req.params.id);

//     return resp.json(cliente);
//   }

//   async update(req, resp) {
//     const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
//       new: true
//     });

//     return resp.json(cliente);
//   }

//   async destroy(req, resp) {
//     await Cliente.findByIdAndDelete(req.params.id);

//     return resp.send();
//   }
// }

// module.exports = new ClienteController();
