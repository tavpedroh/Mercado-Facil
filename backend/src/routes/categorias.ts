import express from "express";
import {
  atualizarCategoria,
  buscarCategoriaPorId,
  criarCategoria,
  listarCategorias,
  removerCategoria,
} from "../controllers/categoriaController";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/common";
import {
  atualizarCategoriaSchema,
  criarCategoriaSchema,
} from "../validators/categoriaValidator";

const router = express.Router();

router.get("/categorias", listarCategorias);
router.get("/categorias/:id", validate(idParamSchema, "params"), buscarCategoriaPorId);
router.post("/categorias", validate(criarCategoriaSchema, "body"), criarCategoria);
router.put(
  "/categorias/:id",
  validate(idParamSchema, "params"),
  validate(atualizarCategoriaSchema, "body"),
  atualizarCategoria
);
router.patch(
  "/categorias/:id",
  validate(idParamSchema, "params"),
  validate(atualizarCategoriaSchema, "body"),
  atualizarCategoria
);
router.delete("/categorias/:id", validate(idParamSchema, "params"), removerCategoria);

export default router;
