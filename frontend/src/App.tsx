import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Folheto from "./pages/Folheto/Folheto";
import CadastroProduto from "./pages/CadastroProduto/CadastroProduto";
import CadastroMercado from "./pages/CadastroMercado/CadastroMercado";
import CadastroCategoria from "./pages/CadastroCategoria/CadastroCategoria";


import "./index.css";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Folheto />} />
        <Route path="/cadastroProduto" element={<CadastroProduto />} />
        <Route path="/cadastroCategoria" element={<CadastroCategoria />} />
        <Route path="/cadastroMercado" element={<CadastroMercado />} />
      </Routes>
    </Router>
  );
};

export default App;
