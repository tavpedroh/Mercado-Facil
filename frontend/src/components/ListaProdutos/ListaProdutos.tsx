import React from "react";
import Produto from "../Produto/Produto";
import "./ListaProdutos.css";

interface ProdutoData {
  _id: string;
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
      {produtos.map( (produto) => (
        <Produto
          key={produto._id}
          produto={produto}
        />
      ) ) }
    </section>
  );
};

export default ListaProdutos;
