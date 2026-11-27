import mongoose, { type InferSchemaType } from "mongoose";

const alertaPrecoSchema = new mongoose.Schema(
  {
    termoProduto: {
      type: String,
      required: true,
      trim: true,
    },
    precoAlvo: {
      type: Number,
      required: true,
      min: 0.01,
    },
    categoria: {
      type: String,
      trim: true,
    },
    mercadoPreferido: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

alertaPrecoSchema.index({ ativo: 1, termoProduto: 1 });
alertaPrecoSchema.index({ categoria: 1 });

export type AlertaPrecoDocument = InferSchemaType<typeof alertaPrecoSchema>;

const AlertaPreco = mongoose.model("AlertaPreco", alertaPrecoSchema);

export default AlertaPreco;
