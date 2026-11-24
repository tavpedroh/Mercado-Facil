import Header from "../../components/Header/Header";
import FormularioMercado from "../../components/FormularioCadastro/FormularioMercado";
import "./CadastroMercado.css";

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
