import React from "react";
import Produto from "../Produto/Produto";
import "./VitrineDestaques.css";
import { ProdutoData } from "../../types/index";

interface VitrineDestaquesProps {
  produtos: ProdutoData[];
}

const VitrineDestaques = ({ produtos }: VitrineDestaquesProps) => {
  const maioresOfertas = [...produtos]
    .sort((a, b) => (b.desconto || 0) - (a.desconto || 0))
    .slice(0, 3);

  if (maioresOfertas.length === 0) return null;

  return (
    <section className="vitrine-destaques">
      <h2 className="titulo-destaques">Maiores Ofertas</h2>
      
      <div className="palco-deslizante">
        {maioresOfertas.map((produto) => (
          <Produto key={produto._id} produto={produto} />
        ))}
      </div>
    </section>
  );
};

export default VitrineDestaques;