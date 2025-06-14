import React from "react";
import Produto from "../Produto/Produto";
import "./ListaProdutosPorCategoria.css";

interface ProdutoData {
  nome: string;
  preco: number;
  mercado: string;
  categoria: string;
  desconto?: number;
}

interface ListaProdutosPorCategoriaProps {
  produtos: ProdutoData[];
  categorias: string[];
  categoriaFiltrada: string | null;
}

const ListaProdutosPorCategoria = ({ produtos, categorias, categoriaFiltrada }: ListaProdutosPorCategoriaProps) => {
  const categoriasParaExibir = categoriaFiltrada ? [categoriaFiltrada] : categorias;

  return (
    <div className="lista-categorias">
      {categoriasParaExibir.map((categoria) => {
        const produtosDaCategoria = produtos.filter((p) => p.categoria === categoria);

        if (produtosDaCategoria.length === 0) return null;

        return (
          <div key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="produtos-horizontal">
              {produtosDaCategoria.map((produto, index) => (
                <Produto key={index} produto={produto} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListaProdutosPorCategoria;
