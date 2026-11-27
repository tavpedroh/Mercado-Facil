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
  apenasAtivas: boolean;
  apenasFavoritos: boolean;
  precoMin: string;
  precoMax: string;
}

interface FiltrosProps {
  filtros: EstadoFiltros;
  categorias: string[];
  mercados: string[];
  totalResultados: number;
  totalFavoritos?: number;
  onChange: (novosFiltros: EstadoFiltros) => void;
  onLimpar: () => void;
}

const Filtros = ({
  filtros,
  categorias,
  mercados,
  totalResultados,
  totalFavoritos = 0,
  onChange,
  onLimpar,
}: FiltrosProps) => {
  const temFiltroAtivo = Boolean(
    filtros.busca.trim() ||
      filtros.categoria ||
      filtros.mercado ||
      filtros.apenasPromocoes ||
      filtros.apenasAtivas ||
      filtros.apenasFavoritos ||
      filtros.precoMin.trim() ||
      filtros.precoMax.trim() ||
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

        <div className="faixa-preco" aria-label="Filtrar por faixa de preço">
          <input
            type="number"
            min="0"
            step="0.5"
            className="campo-preco"
            aria-label="Preço mínimo"
            placeholder="Mín R$"
            value={filtros.precoMin}
            onChange={(e) => onChange({ ...filtros, precoMin: e.target.value })}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            step="0.5"
            className="campo-preco"
            aria-label="Preço máximo"
            placeholder="Máx R$"
            value={filtros.precoMax}
            onChange={(e) => onChange({ ...filtros, precoMax: e.target.value })}
          />
        </div>

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

        <label className="checkbox-promocoes">
          <input
            type="checkbox"
            checked={filtros.apenasAtivas}
            onChange={(e) =>
              onChange({ ...filtros, apenasAtivas: e.target.checked })
            }
          />
          Só ativas
        </label>

        <label className="checkbox-promocoes">
          <input
            type="checkbox"
            checked={filtros.apenasFavoritos}
            onChange={(e) =>
              onChange({ ...filtros, apenasFavoritos: e.target.checked })
            }
          />
          Favoritos{totalFavoritos > 0 ? ` (${totalFavoritos})` : ""}
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
