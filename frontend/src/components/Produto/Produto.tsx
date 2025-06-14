import React from "react";
import "./Produto.css";

  interface ProdutoProps {
    produto:{
      nome: string;
      preco: number;
      mercado: string;
      desconto?: number;
    }
  }
  const Produto = ( { produto } : ProdutoProps) => {
  
  const precoFinal = produto.desconto ? produto.preco - (produto.preco * produto.desconto) / 100 : produto.preco;

  return (
    <div className="produto">
      <h3>{produto.nome || "Produto sem nome"}</h3>
      <p className="mercado">{produto.mercado}</p>
      {produto.desconto && <span className="desconto">Desconto: {produto.desconto}%</span>}
      <p className="preco">
        R$ {typeof precoFinal === "number" ? precoFinal.toFixed(2) : "Preço indisponível"}
      </p>
    </div>
  );
};

export default Produto;

