import React from "react";
import Header from "../../components/Header/Header";
import "./CadastroCategoria.css";
import FormularioCategoria from "../../components/FormularioCadastro/FormularioCategoria";

const CadastroCategoria = () => {
  return (
    <div className="cadastro-categoria">
      <Header />
      <main>
        <FormularioCategoria />
      </main>
    </div>
  );
};

export default CadastroCategoria;
