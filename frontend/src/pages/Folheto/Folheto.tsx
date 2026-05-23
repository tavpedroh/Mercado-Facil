import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Filtros from "../../components/Filtros/Filtros";
import ListaProdutosPorCategoria from "../../components/ListaProdutosPorCategoria/ListaProdutosPorCategoria";
import "./Folheto.css";
import Ordenador from "../../components/Ordenador/Ordenador";
import VitrineDestaques from "../../components/VitrineDestaques/VitrineDestaques";
import { buscarProdutos, buscarCategorias, buscarMercados, ProdutoData } from "../../services/api";

function Folheto() {
  const [produtos, setProdutos] = useState<ProdutoData[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [mercados, setMercados] = useState<string[]>([]);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<string | null>(null);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string>("");

  useEffect(() => {
    buscarProdutos().then((dados) => setProdutos(dados));
    buscarCategorias().then((dados) => setCategorias(dados));
    buscarMercados().then((dados) => setMercados(dados));
  }, []);

  const handleFiltrar = ({ categoria, mercado }: { categoria: string; mercado: string }) => {
    setCategoriaSelecionada(categoria || null);
    setMercadoSelecionado(mercado || null);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    return (
      (!categoriaSelecionada || produto.categoria === categoriaSelecionada) &&
      (!mercadoSelecionado || produto.mercado === mercadoSelecionado)
    );
  });

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    if (ordemSelecionada === "nome-asc") {
      return a.nome.localeCompare(b.nome);
    }
    if (ordemSelecionada === "nome-desc") {
      return b.nome.localeCompare(a.nome);
    }
    if (ordemSelecionada === "preco-asc") {
      return a.preco - b.preco;
    }
    if (ordemSelecionada === "preco-desc") {
      return b.preco - a.preco;
    }
    if (ordemSelecionada === "desconto-desc") {
      const descontoA = a.desconto || 0;
      const descontoB = b.desconto || 0;
      return descontoB - descontoA;
    }
    return 0; 
  });

  return (
    <body className="folheto">
      <Header />
      <div>
        {/* <section className="banner-folheto">
          <h1>Bem-vindo ao Folheto Digital do Mercado Fácil!</h1>
          <p>Encontre as melhores ofertas e organize suas compras com facilidade.</p>
        </section> */}
        <section className="destaques-folheto">
          {/* <h2>Ofertas Imperdíveis</h2>
          <p>Confira os produtos com os maiores descontos e aproveite para economizar!</p> */}
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
                categorias={categorias} 
                categoriaFiltrada={categoriaSelecionada} 
              />
            </div>
          </div>
        </main>
      </div>
    </body>
  );
}

export default Folheto;
