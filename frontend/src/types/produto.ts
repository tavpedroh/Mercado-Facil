export interface Coordenadas {
  lat: number;
  lng: number;
}

export const UNIDADES_PRODUTO = ["un", "kg", "g", "L", "ml", "pct", "cx"] as const;
export type UnidadeProduto = (typeof UNIDADES_PRODUTO)[number];

export interface Categoria {
  _id: string;
  nome: string;
  descricao?: string;
}

export interface NovaCategoriaPayload {
  nome: string;
  descricao?: string;
}

export interface Mercado {
  _id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  horarioFuncionamento?: string;
  logoUrl?: string;
  coordenadas?: Coordenadas;
  localizacao?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface NovoMercadoPayload {
  nome: string;
  endereco?: string;
  telefone?: string;
  horarioFuncionamento?: string;
  logoUrl?: string;
  coordenadas?: Coordenadas;
}

export interface Produto {
  _id?: string;
  nome: string;
  descricao?: string;
  marca?: string;
  unidade?: UnidadeProduto;
  preco: number;
  desconto?: number;
  precoFinal?: number;
  categoria: string;
  mercado: string;
  mercadoId?: string;
  imagemUrl?: string;
  codigoBarras?: string;
  validadeOferta?: string;
  criadoEm?: string;
}

export interface NovoProdutoPayload {
  nome: string;
  descricao?: string;
  marca?: string;
  unidade?: UnidadeProduto;
  preco: number;
  desconto?: number;
  categoria: string;
  mercado: string;
  mercadoId?: string;
  imagemUrl?: string;
  codigoBarras?: string;
  validadeOferta?: string;
}

export interface Paginacao {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface RespostaProdutos {
  dados: Produto[];
  paginacao: Paginacao;
}

export interface FiltrosProdutosQuery {
  busca?: string;
  categoria?: string;
  mercado?: string;
  mercadoId?: string;
  apenasComDesconto?: boolean;
  ativos?: boolean;
  ordenar?: "recentes" | "menor_preco" | "maior_preco" | "maior_desconto";
  page?: number;
  limit?: number;
}

export interface AlertaPreco {
  _id: string;
  termoProduto: string;
  precoAlvo: number;
  categoria?: string;
  mercadoPreferido?: string;
  email?: string;
  ativo: boolean;
}

export interface NovoAlertaPayload {
  termoProduto: string;
  precoAlvo: number;
  categoria?: string;
  mercadoPreferido?: string;
  email?: string;
  ativo?: boolean;
}

export interface AlertaDisparado {
  alerta: AlertaPreco;
  melhorPreco: number;
  ofertasCompativeis: Array<{
    _id?: string;
    nome: string;
    marca?: string;
    mercado: string;
    categoria: string;
    preco: number;
    desconto: number;
    precoFinal: number;
    validadeOferta: string | null;
  }>;
}

export interface ResumoEstatisticas {
  totalProdutos: number;
  totalOfertasAtivas: number;
  totalComDesconto: number;
  totalMercados: number;
  totalCategorias: number;
  descontoMedio: number;
  maioresDescontos: Array<{
    nome?: string;
    categoria: string;
    mercado: string;
    desconto: number;
  }>;
  porCategoria: Array<{ categoria: string; total: number; precoMedio: number }>;
  rankingMercados: Array<{
    mercado: string;
    totalOfertas: number;
    descontoMedio: number;
    precoMedio: number;
  }>;
}
