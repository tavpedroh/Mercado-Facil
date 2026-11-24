<<<<<<< HEAD
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mercadosRouter from "./routes/mercados";
import produtosRouter from "./routes/produtos";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
=======
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routerP from './routes/produtos';
import routerM from './routes/mercados';
import routerC from './routes/categorias';
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b

dotenv.config();

const app = express();

const origensPermitidas = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origem) => origem.trim()).filter(Boolean)
  : null;

app.use(helmet());
app.use(
  cors({
    origin: origensPermitidas && origensPermitidas.length > 0 ? origensPermitidas : true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    mensagem: "API do Sistema Mercado Fácil está rodando!",
    endpoints: ["/health", "/mercados", "/produtos"],
  });
});

app.get("/health", (_req, res) => {
  const estadoMongo = mongoose.connection.readyState === 1 ? "conectado" : "desconectado";
  res.json({
    status: "ok",
    banco: estadoMongo,
    timestamp: new Date().toISOString(),
  });
});

<<<<<<< HEAD
app.use(mercadosRouter);
app.use(produtosRouter);

app.use(notFoundHandler);
app.use(errorHandler);
=======
app.use(routerP);
app.use(routerM);
app.use(routerC);
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "Erro: variável de ambiente MONGODB_URI não definida. Copie backend/.env.example para backend/.env."
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Conectado ao MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erro ao conectar no MongoDB:", err);
    process.exit(1);
  });
