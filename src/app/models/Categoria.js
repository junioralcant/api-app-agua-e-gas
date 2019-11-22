const mongoose = require("mongoose");
const mongoosePagiante = require("mongoose-paginate");

const CategoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  }
});

CategoriaSchema.plugin(mongoosePagiante);
module.exports = mongoose.model("Categoria", CategoriaSchema);
