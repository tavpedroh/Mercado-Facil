import { z } from "zod";

const alertaCamposBase = {
  termoProduto: z
    .string()
    .trim()
    .min(2, "Termo do produto deve ter pelo menos 2 caracteres.")
    .max(120),
  precoAlvo: z
    .number()
    .positive("Preço alvo deve ser maior que zero.")
    .max(100000, "Preço alvo não pode exceder R$ 100.000,00."),
  categoria: z.string().trim().max(80).optional(),
  mercadoPreferido: z.string().trim().max(120).optional(),
  email: z.email("E-mail inválido.").optional().or(z.literal("")),
};

export const criarAlertaSchema = z.object({
  ...alertaCamposBase,
  ativo: z.boolean().optional().default(true),
});

export const atualizarAlertaSchema = z
  .object({
    termoProduto: alertaCamposBase.termoProduto.optional(),
    precoAlvo: alertaCamposBase.precoAlvo.optional(),
    categoria: alertaCamposBase.categoria,
    mercadoPreferido: alertaCamposBase.mercadoPreferido,
    email: alertaCamposBase.email,
    ativo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export const listarAlertasQuerySchema = z.object({
  ativo: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  busca: z.string().trim().max(100).optional(),
});

export type CriarAlertaInput = z.infer<typeof criarAlertaSchema>;
export type AtualizarAlertaInput = z.infer<typeof atualizarAlertaSchema>;
export type ListarAlertasQuery = z.infer<typeof listarAlertasQuerySchema>;
