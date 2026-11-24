import { z } from "zod";
import { UNIDADES_PRODUTO } from "../models/Produto";
import { objectIdSchema } from "./common";

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((val) => val === "true");

const produtoCamposBase = {
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres.").max(150),
  descricao: z.string().trim().max(500).optional(),
  marca: z.string().trim().max(80).optional(),
  unidade: z.enum(UNIDADES_PRODUTO).optional().default("un"),
  preco: z.number().positive("Preço deve ser maior que zero.").max(100000),
  desconto: z.number().min(0, "Desconto mínimo é 0%.").max(100, "Desconto máximo é 100%.").optional().default(0),
  categoria: z.string().trim().min(2, "Categoria é obrigatória.").max(80),
  mercado: z.string().trim().min(2, "Nome do mercado deve ter pelo menos 2 caracteres.").max(120).optional(),
  mercadoId: objectIdSchema.optional(),
  imagemUrl: z.url("URL da imagem inválida.").optional().or(z.literal("")),
  codigoBarras: z
    .string()
    .trim()
    .regex(/^\d{8,14}$/, "Código de barras deve conter entre 8 e 14 dígitos.")
    .optional()
    .or(z.literal("")),
  validadeOferta: z.coerce.date().optional(),
};

export const criarProdutoSchema = z
  .object(produtoCamposBase)
  .refine((data) => Boolean(data.mercado || data.mercadoId), {
    message: "Informe 'mercado' ou 'mercadoId'.",
    path: ["mercado"],
  });

export const atualizarProdutoSchema = z
  .object({
    nome: produtoCamposBase.nome.optional(),
    descricao: produtoCamposBase.descricao,
    marca: produtoCamposBase.marca,
    unidade: z.enum(UNIDADES_PRODUTO).optional(),
    preco: produtoCamposBase.preco.optional(),
    desconto: z.number().min(0).max(100).optional(),
    categoria: produtoCamposBase.categoria.optional(),
    mercado: produtoCamposBase.mercado,
    mercadoId: produtoCamposBase.mercadoId,
    imagemUrl: produtoCamposBase.imagemUrl,
    codigoBarras: produtoCamposBase.codigoBarras,
    validadeOferta: z.coerce.date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export const listarProdutosQuerySchema = z.object({
  busca: z.string().trim().max(100).optional(),
  categoria: z.string().trim().max(80).optional(),
  mercado: z.string().trim().max(120).optional(),
  mercadoId: objectIdSchema.optional(),
  apenasComDesconto: booleanQuerySchema.optional(),
  ativos: booleanQuerySchema.optional(),
  ordenar: z
    .enum(["recentes", "menor_preco", "maior_preco", "maior_desconto"])
    .optional()
    .default("recentes"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>;
export type ListarProdutosQuery = z.infer<typeof listarProdutosQuerySchema>;
