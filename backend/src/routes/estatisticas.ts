import express from "express";
import { obterResumoEstatisticas } from "../controllers/estatisticasController";

const router = express.Router();

router.get("/estatisticas/resumo", obterResumoEstatisticas);

export default router;
