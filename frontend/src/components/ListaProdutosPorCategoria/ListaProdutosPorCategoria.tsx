<<<<<<< HEAD
import type { Produto as ProdutoType } from "../../types/produto";
import { gerarChaveComparacao, type ComparacaoOferta } from "../../utils/comparador";
import Produto from "../Produto/Produto";
import "./ListaProdutosPorCategoria.css";

interface ListaProdutosPorCategoriaProps {
  produtos: ProdutoType[];
  categorias: string[];
  categoriaFiltrada: string | null;
  comparacoes?: Map<string, ComparacaoOferta>;
}

const ListaProdutosPorCategoria = ({
  produtos,
  categorias,
  categoriaFiltrada,
  comparacoes,
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
              />
            ))}
=======
import React, { useState } from "react";
import Produto from "../Produto/Produto";
import "./ListaProdutosPorCategoria.css";
import { ProdutoData } from "../../types/index";
import DetalhamentoProduto from "../DetalhamentoProduto/DetalhamentoProduto";

interface ListaProdutosPorCategoriaProps {
  produtos: ProdutoData[];
  todosOsProdutosRaw: ProdutoData[];
  categorias: string[];
  categoriaFiltrada: string | null;
  aoSelecionarProduto: (produto: ProdutoData) => void;
}

const ListaProdutosPorCategoria = ({ 
  produtos, 
  todosOsProdutosRaw, 
  categorias, 
  categoriaFiltrada 
}: ListaProdutosPorCategoriaProps) => {
  const categoriasParaExibir = categoriaFiltrada ? [categoriaFiltrada] : categorias;
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoData | null>(null);

  return (
    <div className="lista-categorias">
      {categoriasParaExibir.map((categoria) => {
        const produtosDaCategoria = produtos.filter((p) => p.categoria === categoria);

        if (produtosDaCategoria.length === 0) return null;

        return (
          <div key={categoria} className="categoria">
            <h2>{categoria}</h2>
            <div className="produtos-horizontal">
              {produtosDaCategoria.map((produto) => (
                <div 
                  key={produto._id} 
                  onClick={() => setProdutoSelecionado(produto)}
                  style={{ cursor: "pointer" }}
                >
                  <Produto produto={produto} />
                </div>
              ))}
            </div>
            
            {produtoSelecionado && (
              <DetalhamentoProduto 
                produto={produtoSelecionado} 
                /* ENTREGAMOS O ACERVO BRUTO: Agora a janela encontrará os concorrentes */
                todosOsProdutos={todosOsProdutosRaw} 
                aoFechar={() => setProdutoSelecionado(null)} 
              />
            )}
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
          </div>
        </section>
      ))}
    </div>
  );
};

export default ListaProdutosPorCategoria;