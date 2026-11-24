import mongoose, { type InferSchemaType } from "mongoose";

const categoriaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export type CategoriaDocument = InferSchemaType<typeof categoriaSchema>;

const Categorias = mongoose.model("Categorias", categoriaSchema);

export default Categorias;
