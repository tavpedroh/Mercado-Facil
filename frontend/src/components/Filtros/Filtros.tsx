import "./Filtros.css";

export type OrdenacaoOfertas =
  | "recentes"
  | "menor_preco"
  | "maior_preco"
  | "maior_desconto"
  | "nome_asc"
  | "nome_desc";

export interface EstadoFiltros {
  busca: string;
  categoria: string;
  mercado: string;
  ordenar: OrdenacaoOfertas;
  apenasPromocoes: boolean;
}

interface FiltrosProps {
  filtros: EstadoFiltros;
  categorias: string[];
  mercados: string[];
  totalResultados: number;
  onChange: (novosFiltros: EstadoFiltros) => void;
  onLimpar: () => void;
}

const Filtros = ({
  filtros,
  categorias,
  mercados,
  totalResultados,
  onChange,
  onLimpar,
}: FiltrosProps) => {
  const temFiltroAtivo = Boolean(
    filtros.busca.trim() ||
      filtros.categoria ||
      filtros.mercado ||
      filtros.apenasPromocoes ||
      filtros.ordenar !== "recentes"
  );

  return (
    <section className="filtros-bar" aria-label="Filtros e busca de ofertas">
      <div className="filtros">
        <input
          type="search"
          className="campo-busca"
          aria-label="Buscar produto ou marca"
          placeholder="Buscar produto, marca ou descrição..."
          value={filtros.busca}
          onChange={(e) => onChange({ ...filtros, busca: e.target.value })}
        />

        <select
          aria-label="Filtrar por categoria"
          value={filtros.categoria}
          onChange={(e) => onChange({ ...filtros, categoria: e.target.value })}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por mercado"
          value={filtros.mercado}
          onChange={(e) => onChange({ ...filtros, mercado: e.target.value })}
        >
          <option value="">Todos os mercados</option>
          {mercados.map((mercado) => (
            <option key={mercado} value={mercado}>
              {mercado}
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenar ofertas"
          value={filtros.ordenar}
          onChange={(e) =>
            onChange({ ...filtros, ordenar: e.target.value as OrdenacaoOfertas })
          }
        >
          <option value="recentes">Mais recentes</option>
          <option value="menor_preco">Menor preço</option>
          <option value="maior_preco">Maior preço</option>
          <option value="maior_desconto">Maior desconto</option>
          <option value="nome_asc">Nome: A ao Z</option>
          <option value="nome_desc">Nome: Z ao A</option>
        </select>

        <label className="checkbox-promocoes">
          <input
            type="checkbox"
            checked={filtros.apenasPromocoes}
            onChange={(e) =>
              onChange({ ...filtros, apenasPromocoes: e.target.checked })
            }
          />
          Só promoções
        </label>

        {temFiltroAtivo && (
          <button type="button" className="btn-limpar" onClick={onLimpar}>
            Limpar
          </button>
        )}
      </div>

      <p className="resumo-resultados">
        {totalResultados === 1
          ? "1 oferta encontrada"
          : `${totalResultados} ofertas encontradas`}
      </p>
    </section>
  );
};

export default Filtros;
