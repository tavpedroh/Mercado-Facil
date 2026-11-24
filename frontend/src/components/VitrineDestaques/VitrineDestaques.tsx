import type { Produto as ProdutoType } from "../../types/produto";
import { gerarChaveComparacao, type ComparacaoOferta } from "../../utils/comparador";
import Produto from "../Produto/Produto";
import "./VitrineDestaques.css";

interface VitrineDestaquesProps {
  produtos: ProdutoType[];
  comparacoes?: Map<string, ComparacaoOferta>;
  aoSelecionarProduto?: (produto: ProdutoType) => void;
}

const VitrineDestaques = ({
  produtos,
  comparacoes,
  aoSelecionarProduto,
}: VitrineDestaquesProps) => {
  const maioresOfertas = [...produtos]
    .filter((p) => (p.desconto ?? 0) > 0)
    .sort((a, b) => (b.desconto ?? 0) - (a.desconto ?? 0))
    .slice(0, 4);

  if (maioresOfertas.length === 0) return null;

  return (
    <section className="vitrine-destaques" aria-label="Maiores ofertas">
      <h2 className="titulo-destaques">Maiores Ofertas</h2>

      <div className="palco-deslizante">
        {maioresOfertas.map((produto, index) => (
          <Produto
            key={produto._id ?? `${produto.nome}-${produto.mercado}-${index}`}
            produto={produto}
            comparacao={comparacoes?.get(gerarChaveComparacao(produto))}
            aoSelecionar={aoSelecionarProduto}
          />
        ))}
      </div>
    </section>
  );
};

export default VitrineDestaques;
