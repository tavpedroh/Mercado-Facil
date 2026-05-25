import React from "react";
import { ProdutoData } from "../../types/index";
import "./DetalhamentoProduto.css";

interface DetalhamentoProdutoProps {
  produto: ProdutoData;
  todosOsProdutos: ProdutoData[];
  aoFechar: () => void;
}

const DetalhamentoProduto = ({ produto, todosOsProdutos, aoFechar }: DetalhamentoProdutoProps) => {
  
  const outrasOfertas = todosOsProdutos
    .filter((p) => p.nome.toLowerCase() === produto.nome.toLowerCase())
    .sort((a, b) => {
      const precoA = a.preco * (1 - (a.desconto || 0) / 100);
      const precoB = b.preco * (1 - (b.desconto || 0) / 100);
      return precoA - precoB;
    });

  return (
    <div className="dialog-overlay" onClick={aoFechar}>
      <div className="dialog-caixa" onClick={(e) => e.stopPropagation()}>
        <button className="dialog-fechar" onClick={aoFechar}>&times;</button>
        
        <span className="dialog-categoria">{produto.categoria}</span>
        <h2>{produto.nome}</h2>
        <p className="dialog-descricao">{produto.descricao || "Sem descrição disponível."}</p>

        <div className="dialog-secao-precos">
          <h3>Comparativo de Mercados</h3>
          <ul className="lista-comparativa">
            {outrasOfertas.map((oferta) => {
              const precoFinal = oferta.preco * (1 - (oferta.desconto || 0) / 100);
              const ehOAtual = oferta._id === produto._id;

              return (
                <li key={oferta._id} className={ehOAtual ? "item-atual" : ""}>
                  <span className="mercado-nome">
                    {oferta.mercado} {ehOAtual && <strong className="tag-melhor">(Melhor Valor)</strong>}
                  </span>
                  <span className="mercado-preco">
                    {oferta.desconto ? (
                      <span className="preco-riscado">R$ {oferta.preco.toFixed(2)}</span>
                    ) : null}
                    <strong>R$ {precoFinal.toFixed(2)}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetalhamentoProduto;