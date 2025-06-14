import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/produtos';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API do Sistema Mercado Fácil está rodando! 🛒");
});


app.use(router);

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log("🟢 Conectado ao MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("Erro ao conectar no MongoDB:", err));
