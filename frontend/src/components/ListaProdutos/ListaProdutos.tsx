import React from "react";
import Produto from "../Produto/Produto";
import { ProdutoData } from "../../types/index";
import "./ListaProdutos.css";

interface ListaProdutosProps {
  produtos: ProdutoData[];
}

const ListaProdutos = ({ produtos }: ListaProdutosProps) => {
  return (
    <section className="lista-produtos">
      {produtos.map((produto) => (
          <Produto produto={produto} />
      ))}
    </section>
  );
};

export default ListaProdutos;