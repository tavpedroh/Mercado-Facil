import Header from "../../components/Header/Header";
import FormularioProduto from "../../components/FormularioCadastro/FormularioProduto";
import "./CadastroProduto.css";

const CadastroProduto = () => {
  return (
    <div className="cadastro-produto">
      <Header />
      <main>
        <FormularioProduto />
      </main>
    </div>
  );
};

export default CadastroProduto;
