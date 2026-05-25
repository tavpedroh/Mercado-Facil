
export interface ProdutoData {
  _id: string;
  nome: string;
  descricao?: string;
  preco: number;
  mercado: string;
  categoria: string;
  desconto?: number;
}

export interface CategoriaData {
  _id: string;
  nome: string;
}

export interface MercadoData {
  _id: string;
  nome: string;
}