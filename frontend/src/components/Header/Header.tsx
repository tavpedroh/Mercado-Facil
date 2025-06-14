import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <h1 className="titulo">Mercado Fácil</h1>
      <nav className="navegacao">
        <ul>
          <li><a href="#">Ofertas</a></li>
          <li><a href="#">Mapa</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
