import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ListaComprasProvider } from "./context/ListaComprasContext";
import Folheto from "./pages/Folheto";
import Cadastro from "./pages/Cadastro";
import ListaCompras from "./pages/ListaCompras";

const App = () => {
  return (
    <ListaComprasProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Folheto />} />
          <Route path="/lista" element={<ListaCompras />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ListaComprasProvider>
  );
};

export default App;
