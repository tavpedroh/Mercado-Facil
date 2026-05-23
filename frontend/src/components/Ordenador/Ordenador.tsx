import React from "react";
import Select, { OpcaoSelect } from "../Select/Select";
import "./Ordenador.css";

interface OrdenadorProps {
  ordemAtual: string;
  aoEscolherOrdem: (criterio: string) => void;
}

const Ordenador = ({ ordemAtual, aoEscolherOrdem }: OrdenadorProps) => {
  
  const opcoesDeOrdem: OpcaoSelect[] = [
    { valor: "nome-asc", rotulo: "Nome: Letra A ao Z" },
    { valor: "nome-desc", rotulo: "Nome: Letra Z ao A" },
    { valor: "preco-asc", rotulo: "Preço: Do Menor para o Maior" },
    { valor: "preco-desc", rotulo: "Preço: Do Maior para o Menor" },
    { valor: "desconto-desc", rotulo: "Maiores Descontos" }
  ];

  return (
    <div className="ordenador-div">
      <Select
        label="Organizar por: "
        name="ordenador-produtos"
        options={opcoesDeOrdem}
        value={ordemAtual}
        onChange={(e) => aoEscolherOrdem(e.target.value)}
      />
    </div>
  );
};

export default Ordenador;