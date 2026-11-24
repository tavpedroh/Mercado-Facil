import { z } from "zod";

export const criarCategoriaSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres.").max(80),
  descricao: z.string().trim().max(240).optional(),
});

export const atualizarCategoriaSchema = criarCategoriaSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export type CriarCategoriaInput = z.infer<typeof criarCategoriaSchema>;
export type AtualizarCategoriaInput = z.infer<typeof atualizarCategoriaSchema>;
