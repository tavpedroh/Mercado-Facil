import express from "express";
import {
  atualizarAlerta,
  buscarAlertaPorId,
  criarAlerta,
  listarAlertas,
  removerAlerta,
  verificarAlertasDisparados,
} from "../controllers/alertaController";
import { validate } from "../middlewares/validate";
import { idParamSchema } from "../validators/common";
import {
  atualizarAlertaSchema,
  criarAlertaSchema,
  listarAlertasQuerySchema,
} from "../validators/alertaValidator";

const router = express.Router();

router.get("/alertas", validate(listarAlertasQuerySchema, "query"), listarAlertas);
router.get("/alertas/disparados", verificarAlertasDisparados);
router.get("/alertas/:id", validate(idParamSchema, "params"), buscarAlertaPorId);
router.post("/alertas", validate(criarAlertaSchema, "body"), criarAlerta);
router.patch(
  "/alertas/:id",
  validate(idParamSchema, "params"),
  validate(atualizarAlertaSchema, "body"),
  atualizarAlerta
);
router.delete("/alertas/:id", validate(idParamSchema, "params"), removerAlerta);

export default router;
