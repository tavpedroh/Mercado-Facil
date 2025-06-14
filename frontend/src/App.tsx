import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Folheto from "./pages/Folheto";
import Cadastro from "./pages/Cadastro";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Folheto />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </Router>
  );
};

export default App;
