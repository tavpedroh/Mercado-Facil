import  mongoose  from "mongoose";

const mercadoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  endereco: { type: String },
  telefone: { type: String },
  criadoEm: { type: Date, default: Date.now }
});

const Mercado = mongoose.model("Mercado", mercadoSchema);

export default Mercado;