import React from "react";
import { useNavigate } from "react-router";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const aoMudarDirecionamento = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const destino = e.target.value;
    if (destino) {
      navigate(destino); // Transiciona a tela de forma fluida e silenciosa
      e.target.value = "";
    }
  };

  return (
    <header className="header">
      <a href="/">
        <h1 className="titulo">Mercado Fácil</h1>
      </a>
      <nav>  
        <a href="#">Maiores Ofertas</a>  
        <select onChange={aoMudarDirecionamento} defaultValue="">
          <option value="" disabled>Cadastrar...</option>
          <option value="/cadastroCategoria">Cadastrar Categoria</option>
          <option value="/cadastroMercado">Cadastrar Mercado</option>
          <option value="/cadastroProduto">Cadastrar Produto</option>
        </select>
      </nav>
    </header>
  );
};

export default Header;
