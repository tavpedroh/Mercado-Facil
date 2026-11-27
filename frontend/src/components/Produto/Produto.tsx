import type { Produto as ProdutoType } from "../../types/produto";
import { useListaCompras } from "../../context/ListaComprasContext";
import { useFavoritos } from "../../context/FavoritosContext";
import {
  calcularPrecoFinal,
  formatarMoeda,
  obterIdProduto,
  type ComparacaoOferta,
} from "../../utils/comparador";
import {
  calcularPrecoPorUnidadeBase,
  calcularScoreOferta,
  classificarValidadeOferta,
} from "../../utils/ofertasInsights";
import "./Produto.css";

interface ProdutoProps {
  produto: ProdutoType;
  comparacao?: ComparacaoOferta;
  aoSelecionar?: (produto: ProdutoType) => void;
}

const Produto = ({ produto, comparacao, aoSelecionar }: ProdutoProps) => {
  const { adicionarItem, atualizarQuantidade, obterQuantidade } = useListaCompras();
  const { ehFavorito, alternarFavorito } = useFavoritos();

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

  const validadeInfo = classificarValidadeOferta(produto.validadeOferta);
  const precoUnidadeBase = precoValido ? calcularPrecoPorUnidadeBase(produto) : null;
  const scoreOferta = precoValido
    ? calcularScoreOferta(
        produto,
        comparacao?.ofertas.map((o) => o.produto)
      )
    : 0;

  const favorito = ehFavorito(produto);
  const quantidadeNaLista = obterQuantidade(produto);
  const idItem = obterIdProduto(produto);

  return (
    <article
      className={`produto ${ehMelhorPreco ? "produto-melhor-preco" : ""}`}
      onClick={aoSelecionar ? () => aoSelecionar(produto) : undefined}
      style={aoSelecionar ? { cursor: "pointer" } : undefined}
    >
      <div className="produto-topo">
        <div className="produto-badges-topo">
          <div className="produto-selos">
            {ehMelhorPreco && (
              <span className="selo-melhor-preco">
                Melhor preço · -{formatarMoeda(comparacao.economiaMaxima)}
              </span>
            )}
            {scoreOferta >= 45 && (
              <span className="selo-score" title="Score de custo-benefício (0 a 100)">
                Score {scoreOferta}
              </span>
            )}
          </div>
          <button
            type="button"
            className={`btn-favorito ${favorito ? "ativo" : ""}`}
            aria-label={favorito ? `Remover ${produto.nome} dos favoritos` : `Favoritar ${produto.nome}`}
            aria-pressed={favorito}
            onClick={(e) => {
              e.stopPropagation();
              alternarFavorito(produto);
            }}
          >
            {favorito ? "♥" : "♡"}
          </button>
        </div>

        {(validadeInfo.status === "expirada" ||
          validadeInfo.status === "expira_hoje" ||
          validadeInfo.status === "ultimos_dias") && (
          <span className={`selo-validade validade-${validadeInfo.status}`}>
            {validadeInfo.rotulo}
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
        {precoUnidadeBase && (
          <p className="preco-unitario-base">
            {formatarMoeda(precoUnidadeBase.precoBase)} / {precoUnidadeBase.unidadeBase}
          </p>
        )}

        {temMaisBaratoOutroMercado && (
          <p className="dica-comparador">
            Menor por {formatarMoeda(comparacao.menorPreco)} em {comparacao.mercadoMaisBarato}
          </p>
        )}
      </div>

      <div className="produto-acoes" onClick={(e) => e.stopPropagation()}>
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
