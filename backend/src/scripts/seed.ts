import dotenv from "dotenv";
import mongoose from "mongoose";
import Mercado from "../models/Mercado";
import Produto from "../models/Produto";

dotenv.config();

const MERCADOS_INICIAIS = [
  {
    nome: "Mercado A",
    endereco: "Praça da Sé, 100 - Centro, São Paulo - SP",
    horarioFuncionamento: "Seg a Sáb, 08h às 21h",
    localizacao: { type: "Point" as const, coordinates: [-46.6333, -23.5505] },
  },
  {
    nome: "Mercado B",
    endereco: "Rua Direita, 240 - Centro, São Paulo - SP",
    horarioFuncionamento: "Todos os dias, 07h às 22h",
    localizacao: { type: "Point" as const, coordinates: [-46.6344, -23.5511] },
  },
  {
    nome: "Mercado C",
    endereco: "Rua XV de Novembro, 350 - Centro, São Paulo - SP",
    horarioFuncionamento: "Seg a Dom, 08h às 20h",
    localizacao: { type: "Point" as const, coordinates: [-46.6355, -23.5522] },
  },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Erro: defina MONGODB_URI em backend/.env antes de rodar o seed.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Conectado ao MongoDB para seed...");

  const mercadosPorNome = new Map<string, mongoose.Types.ObjectId>();

  for (const dados of MERCADOS_INICIAIS) {
    const doc = await Mercado.findOneAndUpdate(
      { nome: dados.nome },
      { $setOnInsert: dados },
      { upsert: true, new: true }
    );
    mercadosPorNome.set(doc.nome, doc._id);
  }

  console.log(`${mercadosPorNome.size} mercados garantidos no banco.`);

  // Vincula produtos legados que ainda não possuem mercadoId
  for (const [nome, mercadoId] of mercadosPorNome.entries()) {
    await Produto.updateMany(
      { mercado: nome, mercadoId: { $exists: false } },
      { $set: { mercadoId } }
    );
  }

  const totalProdutos = await Produto.countDocuments();
  if (totalProdutos === 0) {
    await Produto.insertMany([
      {
        nome: "Arroz Tipo 1 5kg",
        marca: "Camil",
        unidade: "pct",
        preco: 29.9,
        desconto: 15,
        categoria: "Alimentos",
        mercado: "Mercado A",
        mercadoId: mercadosPorNome.get("Mercado A"),
      },
      {
        nome: "Arroz Tipo 1 5kg",
        marca: "Camil",
        unidade: "pct",
        preco: 31.9,
        desconto: 5,
        categoria: "Alimentos",
        mercado: "Mercado B",
        mercadoId: mercadosPorNome.get("Mercado B"),
      },
      {
        nome: "Café Torrado e Moído 500g",
        marca: "Pilão",
        unidade: "pct",
        preco: 22.5,
        desconto: 10,
        categoria: "Alimentos",
        mercado: "Mercado B",
        mercadoId: mercadosPorNome.get("Mercado B"),
      },
      {
        nome: "Café Torrado e Moído 500g",
        marca: "Pilão",
        unidade: "pct",
        preco: 23.9,
        desconto: 0,
        categoria: "Alimentos",
        mercado: "Mercado C",
        mercadoId: mercadosPorNome.get("Mercado C"),
      },
      {
        nome: "Refrigerante Cola 2L",
        marca: "Coca-Cola",
        unidade: "un",
        preco: 10.99,
        desconto: 20,
        categoria: "Bebidas",
        mercado: "Mercado C",
        mercadoId: mercadosPorNome.get("Mercado C"),
      },
      {
        nome: "Detergente Líquido Neutro 500ml",
        marca: "Ypê",
        unidade: "un",
        preco: 2.99,
        desconto: 0,
        categoria: "Limpeza",
        mercado: "Mercado A",
        mercadoId: mercadosPorNome.get("Mercado A"),
      },
    ]);
    console.log("Produtos iniciais inseridos.");
  } else {
    console.log(`Seed de produtos ignorado (${totalProdutos} produto(s) já cadastrados).`);
  }

  await mongoose.disconnect();
  console.log("Seed concluído com sucesso.");
}

seed().catch((err) => {
  console.error("Erro ao executar seed:", err);
  process.exit(1);
});
