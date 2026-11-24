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
      </nav>
    </header>
  );
};

export default Header;
