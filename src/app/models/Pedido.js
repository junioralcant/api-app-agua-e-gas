const mongoose = require("mongoose");
const mongoosePagiante = require("mongoose-paginate");

const PedidoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produto",
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  valorTotal: {
    type: Number,
    required: true
  }
});

PedidoSchema.plugin(mongoosePagiante);
module.exports = mongoose.model("Pedido", PedidoSchema);
