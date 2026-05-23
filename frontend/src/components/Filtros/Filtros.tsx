import React, { useState } from "react";
import "./Filtros.css";
import Select, { OpcaoSelect } from "../Select/Select";

interface FiltrosProps {
  categorias: string[];
  mercados: string[];
  onFiltrar: (filtros: { categoria: string; mercado: string }) => void;
}

const Filtros = ({ categorias, mercados, onFiltrar }: FiltrosProps) => {

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [mercadoSelecionado, setMercadoSelecionado] = useState("");

  const handleFiltrar = () => {
    onFiltrar({
      categoria: categoriaSelecionada,
      mercado: mercadoSelecionado,
    });
  };

  const opcoesCategorias: OpcaoSelect[] = categorias.map((cat) => ({
    valor: cat,
    rotulo: cat // Como é apenas um filtro simples, a palavra processada e a palavra lida são as mesmas
  }));

  const opcoesMercados: OpcaoSelect[] = mercados.map((mercado) => ({
    valor: mercado,
    rotulo: mercado
  }));

  return (
    <div className="filtros">
      <h2>Filtros</h2>
      <Select
        label="Categoria: "
        name="filtro-categoria"
        options={opcoesCategorias}
        value={categoriaSelecionada}
        onChange={(e) => setCategoriaSelecionada(e.target.value)}
      />

      <Select
        label="Mercado: "
        name="filtro-mercado"
        options={opcoesMercados}
        value={mercadoSelecionado}
        onChange={(e) => setMercadoSelecionado(e.target.value)}
      />

      <button onClick={handleFiltrar}>Filtrar</button>
    </div>
  );
};

export default Filtros;
