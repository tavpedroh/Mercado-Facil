import type { Produto as ProdutoType } from "../../types/produto";
import { useListaCompras } from "../../context/ListaComprasContext";
import {
  calcularPrecoFinal,
  formatarMoeda,
  obterIdProduto,
  type ComparacaoOferta,
} from "../../utils/comparador";
import "./Produto.css";

interface ProdutoProps {
  produto: ProdutoType;
  comparacao?: ComparacaoOferta;
}

const Produto = ({ produto, comparacao }: ProdutoProps) => {
  const { adicionarItem, atualizarQuantidade, obterQuantidade } = useListaCompras();

  const temDesconto = typeof produto.desconto === "number" && produto.desconto > 0;
  const precoValido = typeof produto.preco === "number" && !Number.isNaN(produto.preco);
  const precoFinal = precoValido ? calcularPrecoFinal(produto) : 0;
  const sufixoUnidade = produto.unidade && produto.unidade !== "un" ? ` / ${produto.unidade}` : "";

  const ehMelhorPreco =
    comparacao !== undefined &&
    comparacao.economiaMaxima > 0 &&
    precoFinal <= comparacao.menorPreco;

  const temMaisBaratoOutroMercado =
    comparacao !== undefined &&
    comparacao.economiaMaxima > 0 &&
    precoFinal > comparacao.menorPreco;

  const quantidadeNaLista = obterQuantidade(produto);
  const idItem = obterIdProduto(produto);

  return (
    <article className={`produto ${ehMelhorPreco ? "produto-melhor-preco" : ""}`}>
      <div className="produto-topo">
        {ehMelhorPreco && (
          <span className="selo-melhor-preco">
            Melhor preço · economize {formatarMoeda(comparacao.economiaMaxima)}
          </span>
        )}
        <h3>{produto.nome || "Produto sem nome"}</h3>
        <p className="mercado">
          {produto.mercado}
          {produto.marca ? ` • ${produto.marca}` : ""}
        </p>
        {produto.descricao && <p className="descricao">{produto.descricao}</p>}
      </div>

      <div className="produto-precos">
        {temDesconto && <span className="desconto">-{produto.desconto}% OFF</span>}
        {temDesconto && precoValido && (
          <p className="preco-original">{formatarMoeda(produto.preco)}</p>
        )}
        <p className="preco">
          {precoValido ? `${formatarMoeda(precoFinal)}${sufixoUnidade}` : "Preço indisponível"}
        </p>

        {temMaisBaratoOutroMercado && (
          <p className="dica-comparador">
            Menor por {formatarMoeda(comparacao.menorPreco)} em {comparacao.mercadoMaisBarato}
          </p>
        )}
      </div>

      <div className="produto-acoes">
        {quantidadeNaLista === 0 ? (
          <button
            type="button"
            className="btn-adicionar-lista"
            onClick={() => adicionarItem(produto)}
          >
            + Adicionar à lista
          </button>
        ) : (
          <div className="controle-quantidade" aria-label={`Quantidade de ${produto.nome}`}>
            <button
              type="button"
              onClick={() => atualizarQuantidade(idItem, quantidadeNaLista - 1)}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span>{quantidadeNaLista} na lista</span>
            <button
              type="button"
              onClick={() => atualizarQuantidade(idItem, quantidadeNaLista + 1)}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default Produto;
