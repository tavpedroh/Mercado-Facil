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
          </div>
        );
      })}
    </div>
  );
};

export default ListaProdutosPorCategoria;