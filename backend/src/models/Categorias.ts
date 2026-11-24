import  mongoose  from "mongoose";

const categoriaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String }
});

const Categorias = mongoose.model("Categorias", categoriaSchema);

export default Categorias;