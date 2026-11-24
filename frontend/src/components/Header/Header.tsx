<<<<<<< HEAD
import { Link, useLocation } from "react-router";
import { useListaCompras } from "../../context/ListaComprasContext";
import "./Header.css";

const Header = () => {
  const { pathname, hash } = useLocation();
  const { totalUnidades } = useListaCompras();

  return (
    <header className="header">
      <Link to="/" className="titulo-link">
        <h1 className="titulo">Mercado Fácil</h1>
      </Link>
      <nav className="navegacao" aria-label="Navegação principal">
        <ul>
          <li>
            <Link to="/" className={pathname === "/" && hash !== "#mapa" ? "ativo" : ""}>
              Ofertas
            </Link>
          </li>
          <li>
            <Link to="/#mapa" className={pathname === "/" && hash === "#mapa" ? "ativo" : ""}>
              Mapa
            </Link>
          </li>
          <li>
            <Link to="/lista" className={pathname === "/lista" ? "ativo" : ""}>
              Minha Lista
              {totalUnidades > 0 && <span className="badge-lista">{totalUnidades}</span>}
            </Link>
          </li>
          <li>
            <Link to="/cadastro" className={pathname === "/cadastro" ? "ativo" : ""}>
              Cadastrar Produto
            </Link>
          </li>
        </ul>
=======
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
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
      </nav>
    </header>
  );
};

export default Header;
