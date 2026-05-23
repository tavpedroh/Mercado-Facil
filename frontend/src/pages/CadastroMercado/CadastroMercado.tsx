import React from "react";
import Header from "../../components/Header/Header";
import "./CadastroMercado.css";
import FormularioMercado from "../../components/FormularioCadastro/FormularioMercado";

const CadastroMercado = () => {
  return (
    <div className="cadastro-mercado">
      <Header />
      <main>
        <FormularioMercado />
      </main>
    </div>
  );
};

export default CadastroMercado;
