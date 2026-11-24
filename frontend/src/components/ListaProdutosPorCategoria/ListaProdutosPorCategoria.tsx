import type { Produto as ProdutoType } from "../../types/produto";
import { gerarChaveComparacao, type ComparacaoOferta } from "../../utils/comparador";
import Produto from "../Produto/Produto";
import "./ListaProdutosPorCategoria.css";

interface ListaProdutosPorCategoriaProps {
  produtos: ProdutoType[];
  categorias: string[];
  categoriaFiltrada: string | null;
  comparacoes?: Map<string, ComparacaoOferta>;
  aoSelecionarProduto?: (produto: ProdutoType) => void;
}

const ListaProdutosPorCategoria = ({
  produtos,
  categorias,
  categoriaFiltrada,
  comparacoes,
  aoSelecionarProduto,
}: ListaProdutosPorCategoriaProps) => {
  const categoriasParaExibir = categoriaFiltrada ? [categoriaFiltrada] : categorias;
  const secoesVisiveis = categoriasParaExibir
    .map((categoria) => ({
      categoria,
      itens: produtos.filter((p) => (p.categoria || "Sem categoria") === categoria),
    }))
    .filter((secao) => secao.itens.length > 0);

  if (secoesVisiveis.length === 0) {
    return (
      <div className="lista-categorias">
        <p className="estado-vazio">Nenhum produto encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="lista-categorias">
      {secoesVisiveis.map(({ categoria, itens }) => (
        <section key={categoria} className="categoria">
          <h2>{categoria}</h2>
          <div className="produtos-horizontal">
            {itens.map((produto, index) => (
              <Produto
                key={produto._id ?? `${produto.nome}-${produto.mercado}-${index}`}
                produto={produto}
                comparacao={comparacoes?.get(gerarChaveComparacao(produto))}
                aoSelecionar={aoSelecionarProduto}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ListaProdutosPorCategoria;
