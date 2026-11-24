<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { ListaComprasProvider } from "./context/ListaComprasContext";
import Folheto from "./pages/Folheto";
import Cadastro from "./pages/Cadastro";
import ListaCompras from "./pages/ListaCompras";
=======
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Folheto from "./pages/Folheto/Folheto";
import CadastroProduto from "./pages/CadastroProduto/CadastroProduto";
import CadastroMercado from "./pages/CadastroMercado/CadastroMercado";
import CadastroCategoria from "./pages/CadastroCategoria/CadastroCategoria";
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b


import "./index.css";
const App = () => {
  return (
<<<<<<< HEAD
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
=======
    <Router>
      <Routes>
        <Route path="/" element={<Folheto />} />
        <Route path="/cadastroProduto" element={<CadastroProduto />} />
        <Route path="/cadastroCategoria" element={<CadastroCategoria />} />
        <Route path="/cadastroMercado" element={<CadastroMercado />} />
      </Routes>
    </Router>
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
  );
};

export default App;
