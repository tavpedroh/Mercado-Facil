import { useEffect } from "react";
import type { Produto } from "../../types/produto";
import { useListaCompras } from "../../context/ListaComprasContext";
import {
  calcularPrecoFinal,
  formatarMoeda,
  gerarChaveComparacao,
  obterIdProduto,
} from "../../utils/comparador";
import "./DetalhamentoProduto.css";

interface DetalhamentoProdutoProps {
  produto: Produto;
  todosOsProdutos: Produto[];
  aoFechar: () => void;
}

const DetalhamentoProduto = ({
  produto,
  todosOsProdutos,
  aoFechar,
}: DetalhamentoProdutoProps) => {
  const { adicionarItem } = useListaCompras();

  useEffect(() => {
    const aoPressionarEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", aoPressionarEsc);
    return () => window.removeEventListener("keydown", aoPressionarEsc);
  }, [aoFechar]);

  const chaveProduto = gerarChaveComparacao(produto);
  const outrasOfertas = todosOsProdutos
    .filter((p) => gerarChaveComparacao(p) === chaveProduto)
    .sort((a, b) => calcularPrecoFinal(a) - calcularPrecoFinal(b));

  const ofertasParaMostrar = outrasOfertas.length > 0 ? outrasOfertas : [produto];
  const menorPreco = calcularPrecoFinal(ofertasParaMostrar[0]);

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-produto-titulo"
      onClick={aoFechar}
    >
      <div className="dialog-caixa" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="dialog-fechar"
          onClick={aoFechar}
          aria-label="Fechar detalhes"
        >
          &times;
        </button>

        <span className="dialog-categoria">
          {produto.categoria}
          {produto.marca ? ` • ${produto.marca}` : ""}
        </span>
        <h2 id="dialog-produto-titulo">{produto.nome}</h2>
        <p className="dialog-descricao">
          {produto.descricao || "Sem descrição disponível."}
        </p>

        <div className="dialog-secao-precos">
          <h3>Comparativo de Mercados</h3>
          <ul className="lista-comparativa">
            {ofertasParaMostrar.map((oferta, index) => {
              const precoFinal = calcularPrecoFinal(oferta);
              const ehMenor = precoFinal <= menorPreco;
              const temDesconto = typeof oferta.desconto === "number" && oferta.desconto > 0;

              return (
                <li
                  key={obterIdProduto(oferta) + "-" + index}
                  className={ehMenor ? "item-atual" : ""}
                >
                  <div>
                    <span className="mercado-nome">
                      {oferta.mercado}
                      {ehMenor && ofertasParaMostrar.length > 1 && (
                        <strong className="tag-melhor">(Melhor preço)</strong>
                      )}
                    </span>
                    <div className="mercado-preco">
                      {temDesconto && (
                        <span className="preco-riscado">
                          {formatarMoeda(oferta.preco)}
                        </span>
                      )}
                      <strong>{formatarMoeda(precoFinal)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-dialog-add"
                    onClick={() => adicionarItem(oferta)}
                  >
                    + Lista
                  </button>
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
