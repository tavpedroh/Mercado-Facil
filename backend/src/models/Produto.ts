import mongoose, { type InferSchemaType } from "mongoose";

export const UNIDADES_PRODUTO = ["un", "kg", "g", "L", "ml", "pct", "cx"] as const;

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    descricao: {
      type: String,
      trim: true,
    },
    marca: {
      type: String,
      trim: true,
    },
    unidade: {
      type: String,
      enum: UNIDADES_PRODUTO,
      default: "un",
    },
    preco: {
      type: Number,
      required: true,
      min: 0.01,
    },
    desconto: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    categoria: {
      type: String,
      required: true,
      trim: true,
    },
    mercado: {
      type: String,
      required: true,
      trim: true,
    },
    mercadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mercado",
    },
    imagemUrl: {
      type: String,
      trim: true,
    },
    codigoBarras: {
      type: String,
      trim: true,
    },
    validadeOferta: {
      type: Date,
    },
    criadoEm: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

produtoSchema.virtual("precoFinal").get(function () {
  const desconto = this.desconto ?? 0;
  const valor = this.preco - (this.preco * desconto) / 100;
  return Number(valor.toFixed(2));
});

produtoSchema.index({ categoria: 1, mercado: 1 });
produtoSchema.index({ mercadoId: 1 });
produtoSchema.index({ codigoBarras: 1 });
produtoSchema.index({ nome: "text", descricao: "text", marca: "text" });

export type ProdutoDocument = InferSchemaType<typeof produtoSchema>;

const Produto = mongoose.model("Produto", produtoSchema);

export default Produto;
