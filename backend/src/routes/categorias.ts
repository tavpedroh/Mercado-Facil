import express from "express";
import Categorias from "../models/Categorias";

const routerC = express.Router();


routerC.get("/categorias", async (req, res) => {
  try {
    const categorias = await Categorias.find();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar categorias" });
  }
});


routerC.post("/categorias", async (req, res) => {
  try {
    const novaCategoria = new Categorias(req.body);
    await novaCategoria.save();
    res.status(201).json(novaCategoria);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao cadastrar mercado" });
  }
});


export default routerC;
