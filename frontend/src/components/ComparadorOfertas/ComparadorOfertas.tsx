import { formatarMoeda, type ComparacaoOferta } from "../../utils/comparador";
import { useListaCompras } from "../../context/ListaComprasContext";
import "./ComparadorOfertas.css";

interface ComparadorOfertasProps {
  comparacoes: ComparacaoOferta[];
}

const ComparadorOfertas = ({ comparacoes }: ComparadorOfertasProps) => {
  const { adicionarItem } = useListaCompras();

  const destaques = comparacoes
    .filter((c) => c.economiaMaxima > 0)
    .sort((a, b) => b.economiaMaxima - a.economiaMaxima)
    .slice(0, 6);

  if (destaques.length === 0) {
    return null;
  }

  return (
    <section className="comparador-ofertas" aria-label="Comparador de preços entre mercados">
      <div className="comparador-cabecalho">
        <h2>Comparador de Preços</h2>
        <p>Mesmos produtos encontrados em mercados diferentes — veja onde sai mais barato.</p>
      </div>

      <div className="comparador-grid">
        {destaques.map((item) => {
          const melhorOferta = item.ofertas[0];
          return (
            <article key={item.chave} className="comparador-card">
              <div className="comparador-card-topo">
                <h3>{item.nomeReferencia}</h3>
                <span className="comparador-economia">
                  Economize {formatarMoeda(item.economiaMaxima)}
                </span>
              </div>

              <ul className="comparador-lista-precos">
                {item.ofertas.map(({ produto, precoFinal }, idx) => (
                  <li
                    key={produto._id ?? `${produto.mercado}-${idx}`}
                    className={idx === 0 ? "oferta-campea" : ""}
                  >
                    <span>
                      {produto.mercado}
                      {idx === 0 ? " (Menor preço)" : ""}
                    </span>
                    <strong>{formatarMoeda(precoFinal)}</strong>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn-comparador-add"
                onClick={() => adicionarItem(melhorOferta.produto)}
              >
                + Adicionar menor preço à lista
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ComparadorOfertas;
