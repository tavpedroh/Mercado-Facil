import mongoose, { type InferSchemaType } from "mongoose";

const localizacaoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    // GeoJSON utiliza a ordem [longitude, latitude]
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coords: number[]) =>
          Array.isArray(coords) &&
          coords.length === 2 &&
          coords[0] >= -180 &&
          coords[0] <= 180 &&
          coords[1] >= -90 &&
          coords[1] <= 90,
        message: "Coordenadas inválidas. Use [longitude, latitude].",
      },
    },
  },
  { _id: false }
);

const mercadoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    endereco: {
      type: String,
      trim: true,
    },
    telefone: {
      type: String,
      trim: true,
    },
    horarioFuncionamento: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
    },
    localizacao: {
      type: localizacaoSchema,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

mercadoSchema.virtual("coordenadas").get(function () {
  const coords = this.localizacao?.coordinates;
  if (!Array.isArray(coords) || coords.length !== 2) {
    return undefined;
  }
  return {
    lng: coords[0],
    lat: coords[1],
  };
});

mercadoSchema.index({ localizacao: "2dsphere" }, { sparse: true });

export type MercadoDocument = InferSchemaType<typeof mercadoSchema>;

const Mercado = mongoose.model("Mercado", mercadoSchema);

export default Mercado;
