import React from "react";
import Produto from "../Produto/Produto";
import "./ListaProdutos.css";

interface ProdutoData {
  nome: string;
  preco: number;
  mercado: string;
  desconto?: number;
}

interface ListaProdutosProps {
  produtos: ProdutoData[];
}

const ListaProdutos = ({ produtos }: ListaProdutosProps) => {
  return (
    <section className="lista-produtos">
      {produtos.map((produto, index) => (
        <Produto
          key={index}
          nome={produto.nome}
          preco={produto.preco}
          mercado={produto.mercado}
          desconto={produto.desconto}
        />
      ))}
    </section>
  );
};

export default ListaProdutos;
