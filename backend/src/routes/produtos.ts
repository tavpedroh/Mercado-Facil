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

const router = express.Router();

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

export default router;
