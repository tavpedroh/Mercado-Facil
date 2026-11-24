import type { ChangeEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useListaCompras } from "../../context/ListaComprasContext";
import "./Header.css";

const Header = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { totalUnidades } = useListaCompras();

  const aoMudarCadastro = (e: ChangeEvent<HTMLSelectElement>) => {
    const destino = e.target.value;
    if (destino) {
      void navigate(destino);
    }
  };

  const rotaCadastroAtual =
    pathname === "/cadastroProduto" ||
    pathname === "/cadastroMercado" ||
    pathname === "/cadastroCategoria"
      ? pathname
      : "";

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
            <select
              className="select-cadastro"
              aria-label="Menu de cadastros"
              value={rotaCadastroAtual}
              onChange={aoMudarCadastro}
            >
              <option value="" disabled>
                Cadastrar...
              </option>
              <option value="/cadastroProduto">Cadastrar Produto</option>
              <option value="/cadastroMercado">Cadastrar Mercado</option>
              <option value="/cadastroCategoria">Cadastrar Categoria</option>
            </select>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
