import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String },
  preco: { type: Number, required: true },
  desconto: { type: Number, default: 0 }, // porcentagem
  categoria: { type: String },
  mercado: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

const Produto = mongoose.model("Produto", produtoSchema);

export default Produto;
