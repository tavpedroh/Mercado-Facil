import React, { useEffect, useState } from "react";
import "./Folheto.css";

import Header from "../../components/Header/Header";
import Filtros from "../../components/Filtros/Filtros";
import ListaProdutosPorCategoria from "../../components/ListaProdutosPorCategoria/ListaProdutosPorCategoria";
import Ordenador from "../../components/Ordenador/Ordenador";
import VitrineDestaques from "../../components/VitrineDestaques/VitrineDestaques";
import DetalhamentoProduto from "../../components/DetalhamentoProduto/DetalhamentoProduto";

import { buscarProdutos, buscarCategorias, buscarMercados } from "../../services/api";
import { ProdutoData } from "../../types/index";
import { reterApenasMenorPreco, aplicarFiltros, aplicarOrdenacao } from "../../regras/triagemMercadorias";

function Folheto() {
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mercados, setMercados] = useState<string[]>([]);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<string | null>(null);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string>("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoData | null>(null);

  useEffect(() => {
    buscarProdutos().then((dados) => setProdutos(dados));
    buscarCategorias().then((dados) => setCategorias(dados));
    buscarMercados().then((dados) => setMercados(dados));
  }, []);

  const handleFiltrar = ({ categoria, mercado }: { categoria: string; mercado: string }) => {
    setCategoriaSelecionada(categoria || null);
    setMercadoSelecionado(mercado || null);
  };

  const produtosUnicos = reterApenasMenorPreco(produtos);
  const produtosFiltrados = aplicarFiltros(produtosUnicos, categoriaSelecionada, mercadoSelecionado);
  const produtosOrdenados = aplicarOrdenacao(produtosFiltrados, ordemSelecionada);

  return (
    <div className="folheto-container">
      <Header />
      <div>
        
        <section className="destaques-folheto">
          <VitrineDestaques produtos={produtos} />
        </section>
        
        <main>
          <h1>Produtos</h1>
          <div className="folheto-div">
            <menu className="menu-lateral">
              <Filtros
                categorias={categorias}
                mercados={mercados}
                onFiltrar={handleFiltrar}
              />
              <Ordenador aoEscolherOrdem={setOrdemSelecionada} ordemAtual={ordemSelecionada} />
            </menu>
            
            <div className="conteudo-principal">
              <ListaProdutosPorCategoria 
                produtos={produtosOrdenados} 
                todosOsProdutosRaw={produtos}
                categorias={categorias} 
                categoriaFiltrada={categoriaSelecionada} 
                aoSelecionarProduto={setProdutoSelecionado}
              />
            </div>
          </div>
        </main>
      </div>

      {produtoSelecionado && (
        <DetalhamentoProduto 
          produto={produtoSelecionado} 
          todosOsProdutos={produtos}
          aoFechar={() => setProdutoSelecionado(null)} 
        />
      )}
    </div>
  );
}

export default Folheto;