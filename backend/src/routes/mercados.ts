import express from "express";
import Mercado from "../models/Mercados";

const routerM = express.Router();


routerM.get("/mercados", async (req, res) => {
  try {
    const mercados = await Mercado.find();
    res.json(mercados);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar mercados" });
  }
});


routerM.post("/mercados", async (req, res) => {
  try {
    const novoMercado = new Mercado(req.body);
    await novoMercado.save();
    res.status(201).json(novoMercado);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao cadastrar mercado" });
  }
});


export default routerM;
