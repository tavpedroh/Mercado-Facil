import express from "express";
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  listarProdutos,
  removerProduto,
} from "../controllers/produtoController";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/common";
import {
  atualizarProdutoSchema,
  criarProdutoSchema,
  listarProdutosQuerySchema,
} from "../validators/produtoValidator";

const routerP = express.Router();

<<<<<<< HEAD
router.get("/produtos", validate(listarProdutosQuerySchema, "query"), listarProdutos);
router.get("/produtos/:id", validate(idParamSchema, "params"), buscarProdutoPorId);
router.post("/produtos", validate(criarProdutoSchema, "body"), criarProduto);
router.put(
  "/produtos/:id",
  validate(idParamSchema, "params"),
  validate(atualizarProdutoSchema, "body"),
  atualizarProduto
);
router.patch(
  "/produtos/:id",
  validate(idParamSchema, "params"),
  validate(atualizarProdutoSchema, "body"),
  atualizarProduto
);
router.delete("/produtos/:id", validate(idParamSchema, "params"), removerProduto);
=======

routerP.get("/produtos", async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar produtos" });
  }
});


routerP.post("/produtos", async (req, res) => {
  try {
    const novoProduto = new Produto(req.body);
    await novoProduto.save();
    res.status(201).json(novoProduto);
  } catch (err) {
    res.status(400).json({ erro: "Erro ao cadastrar produto" });
  }
});
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b


export default routerP;
