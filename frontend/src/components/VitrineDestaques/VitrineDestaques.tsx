import React from "react";
import Produto from "../Produto/Produto";
import "./VitrineDestaques.css";

interface ProdutoData {
  _id: string;
  nome: string;
  preco: number;
  mercado: string;
  categoria: string;
  desconto?: number;
}

interface VitrineDestaquesProps {
  produtos: ProdutoData[];
}

const VitrineDestaques = ({ produtos }: VitrineDestaquesProps) => {
  // 1. Replicamos a coleção para proteger a fonte original
  // 2. Ordenamos matematicamente do maior para o menor desconto
  // 3. Aplicamos o corte (slice) para reter apenas as posições 0, 1 e 2
  const maioresOfertas = [...produtos]
    .sort((a, b) => (b.desconto || 0) - (a.desconto || 0))
    .slice(0, 3);

  // Se não houver ofertas, o palco recolhe-se em silêncio
  if (maioresOfertas.length === 0) return null;

  return (
    <section className="vitrine-destaques">
      <h2 className="titulo-destaques">Maiores Ofertas</h2>
      
      <div className="palco-deslizante">
        {maioresOfertas.map((produto) => (
          // A essência imutável (_id) mantém a organização perfeita
          <Produto key={produto._id} produto={produto} />
        ))}
      </div>
    </section>
  );
};

export default VitrineDestaques;