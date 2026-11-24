import Header from "../../components/Header/Header";
import FormularioCategoria from "../../components/FormularioCadastro/FormularioCategoria";
import "./CadastroCategoria.css";

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
