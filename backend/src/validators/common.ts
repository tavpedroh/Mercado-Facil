import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "ID inválido (esperado ObjectId de 24 caracteres hexadecimais).");

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export function escapeRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
