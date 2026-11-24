import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ListaComprasProvider } from "./context/ListaComprasContext";
import Folheto from "./pages/Folheto/Folheto";
import ListaCompras from "./pages/ListaCompras";
import CadastroProduto from "./pages/CadastroProduto/CadastroProduto";
import CadastroMercado from "./pages/CadastroMercado/CadastroMercado";
import CadastroCategoria from "./pages/CadastroCategoria/CadastroCategoria";

const App = () => {
  return (
    <ListaComprasProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Folheto />} />
          <Route path="/lista" element={<ListaCompras />} />
          <Route path="/cadastroProduto" element={<CadastroProduto />} />
          <Route path="/cadastro" element={<Navigate to="/cadastroProduto" replace />} />
          <Route path="/cadastroMercado" element={<CadastroMercado />} />
          <Route path="/cadastroCategoria" element={<CadastroCategoria />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ListaComprasProvider>
  );
};

export default App;
