import express from "express";
<<<<<<< HEAD
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
=======
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
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
