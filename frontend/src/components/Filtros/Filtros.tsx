import React, { useState } from "react";
import "./Filtros.css";

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

  return (
    <div className="filtros">
      <select
        value={categoriaSelecionada}
        onChange={(e) => setCategoriaSelecionada(e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat, idx) => (
          <option key={idx} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={mercadoSelecionado}
        onChange={(e) => setMercadoSelecionado(e.target.value)}
      >
        <option value="">Todos os mercados</option>
        {mercados.map((mercado, idx) => (
          <option key={idx} value={mercado}>
            {mercado}
          </option>
        ))}
      </select>

      <button onClick={handleFiltrar}>Filtrar</button>
    </div>
  );
};

export default Filtros;
