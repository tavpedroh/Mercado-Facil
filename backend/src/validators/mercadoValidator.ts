import { z } from "zod";

const coordenadasSchema = z.object({
  lat: z.number().min(-90, "Latitude deve estar entre -90 e 90.").max(90, "Latitude deve estar entre -90 e 90."),
  lng: z.number().min(-180, "Longitude deve estar entre -180 e 180.").max(180, "Longitude deve estar entre -180 e 180."),
});

export const criarMercadoSchema = z.object({
  nome: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres.").max(120),
  endereco: z.string().trim().max(240).optional(),
  telefone: z.string().trim().max(30).optional(),
  horarioFuncionamento: z.string().trim().max(120).optional(),
  logoUrl: z.url("URL do logo inválida.").optional().or(z.literal("")),
  coordenadas: coordenadasSchema,
});

export const atualizarMercadoSchema = criarMercadoSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export const listarMercadosQuerySchema = z
  .object({
    busca: z.string().trim().max(100).optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    raioKm: z.coerce.number().positive().max(200).optional(),
  })
  .refine(
    (q) => (q.lat === undefined && q.lng === undefined) || (q.lat !== undefined && q.lng !== undefined),
    {
      message: "Informe tanto 'lat' quanto 'lng' para filtrar por proximidade.",
    }
  );

export type CriarMercadoInput = z.infer<typeof criarMercadoSchema>;
export type AtualizarMercadoInput = z.infer<typeof atualizarMercadoSchema>;
export type ListarMercadosQuery = z.infer<typeof listarMercadosQuerySchema>;
