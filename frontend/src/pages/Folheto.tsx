import React, { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import Filtros from "../components/Filtros/Filtros";
import ListaProdutosPorCategoria from "../components/ListaProdutosPorCategoria/ListaProdutosPorCategoria";
import MapaMercados from "../components/MapaMercados/MapaMercados";

interface Produto {
  nome: string;
  preco: number;
  mercado: string;
  categoria: string;
  desconto?: number;
}

const coordenadasMercados: Record<string, { lat: number; lng: number }> = {
  "Mercado A": { lat: -23.5505, lng: -46.6333 },
  "Mercado B": { lat: -23.5511, lng: -46.6344 },
  "Mercado C": { lat: -23.5522, lng: -46.6355 },
};

function buscarCoordenadaMercado(nome: string) {
  return coordenadasMercados[nome];
}


function Folheto() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [mercadoSelecionado, setMercadoSelecionado] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error("Erro ao buscar produtos:", err));
  }, []);

  const [coordenadas, setCoordenadas] = useState({ lat: -23.55, lng: -46.63 }); // padrão

  const handleFiltrar = ({ categoria, mercado }: { categoria: string; mercado: string }) => {
    setCategoriaSelecionada(categoria || null);
    setMercadoSelecionado(mercado || null);

    const novaCoord = buscarCoordenadaMercado(mercado);
    if (novaCoord) setCoordenadas(novaCoord);
  };

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria)));

  const produtosFiltrados = produtos.filter((produto) => {
    return (
      (!categoriaSelecionada || produto.categoria === categoriaSelecionada) &&
      (!mercadoSelecionado || produto.mercado === mercadoSelecionado)
    );
  });

  

  return (
    <div>
      <Header />
      <Filtros
        categorias={categorias}
        mercados={["Mercado A", "Mercado B", "Mercado C"]}
        onFiltrar={handleFiltrar}
      />
      <ListaProdutosPorCategoria produtos={produtosFiltrados} categorias={categorias} categoriaFiltrada={categoriaSelecionada} />
      <MapaMercados coordenadas={coordenadas} />
    </div>
  );
}

export default Folheto;
