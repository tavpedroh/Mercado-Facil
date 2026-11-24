import express from "express";
import {
  atualizarMercado,
  buscarMercadoPorId,
  criarMercado,
  listarMercados,
  removerMercado,
} from "../controllers/mercadoController";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/common";
import {
  atualizarMercadoSchema,
  criarMercadoSchema,
  listarMercadosQuerySchema,
} from "../validators/mercadoValidator";

const router = express.Router();

router.get("/mercados", validate(listarMercadosQuerySchema, "query"), listarMercados);
router.get("/mercados/:id", validate(idParamSchema, "params"), buscarMercadoPorId);
router.post("/mercados", validate(criarMercadoSchema, "body"), criarMercado);
router.put(
  "/mercados/:id",
  validate(idParamSchema, "params"),
  validate(atualizarMercadoSchema, "body"),
  atualizarMercado
);
router.patch(
  "/mercados/:id",
  validate(idParamSchema, "params"),
  validate(atualizarMercadoSchema, "body"),
  atualizarMercado
);
router.delete("/mercados/:id", validate(idParamSchema, "params"), removerMercado);

export default router;
