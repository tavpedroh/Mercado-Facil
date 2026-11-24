import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import Header from "../components/Header/Header";
import Filtros, { type EstadoFiltros } from "../components/Filtros/Filtros";
import ComparadorOfertas from "../components/ComparadorOfertas/ComparadorOfertas";
import ListaProdutosPorCategoria from "../components/ListaProdutosPorCategoria/ListaProdutosPorCategoria";
import MapaMercados, { type MercadoNoMapa } from "../components/MapaMercados/MapaMercados";
import {
  buscarCoordenadaMercado,
  COORDENADAS_PADRAO,
  MERCADOS as MERCADOS_PADRAO,
} from "../constants/mercados";
import { listarMercados, listarProdutos } from "../services/api";
import type { Coordenadas, Mercado, Produto } from "../types/produto";
import {
  calcularPrecoFinal,
  construirMapaComparacoes,
} from "../utils/comparador";
import "./Folheto.css";

const FILTROS_INICIAIS: EstadoFiltros = {
  busca: "",
  categoria: "",
  mercado: "",
  ordenar: "recentes",
  apenasPromocoes: false,
};

function extrairCoordenadasMercado(mercado: Mercado): Coordenadas | undefined {
  if (mercado.coordenadas) {
    return mercado.coordenadas;
  }
  const coords = mercado.localizacao?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    return { lng: coords[0], lat: coords[1] };
  }
  return undefined;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Folheto() {
  const { hash } = useLocation();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mercadosApi, setMercadosApi] = useState<Mercado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<EstadoFiltros>(FILTROS_INICIAIS);

  const carregarDados = useCallback(async (signal?: AbortSignal) => {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosProdutos, dadosMercados] = await Promise.all([
        listarProdutos({ limit: 100 }, signal),
        listarMercados(signal).catch(() => [] as Mercado[]),
      ]);
      setProdutos(dadosProdutos);
      setMercadosApi(dadosMercados);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as ofertas. Verifique se a API está rodando."
      );
    } finally {
      if (!signal?.aborted) {
        setCarregando(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void carregarDados(controller.signal);
    return () => controller.abort();
  }, [carregarDados]);

  useEffect(() => {
    if (hash === "#mapa") {
      document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  const comparacoes = useMemo(() => construirMapaComparacoes(produtos), [produtos]);

  const categorias = useMemo(
    () => Array.from(new Set(produtos.map((p) => p.categoria || "Sem categoria"))),
    [produtos]
  );

  const mercadosDisponiveis = useMemo(
    () =>
      mercadosApi.length > 0
        ? mercadosApi.map((m) => m.nome)
        : Array.from(new Set([...MERCADOS_PADRAO, ...produtos.map((p) => p.mercado)])),
    [mercadosApi, produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const termoBusca = normalizarTexto(filtros.busca.trim());

    const filtrados = produtos.filter((produto) => {
      const categoriaProduto = produto.categoria || "Sem categoria";
      if (filtros.categoria && categoriaProduto !== filtros.categoria) return false;
      if (filtros.mercado && produto.mercado !== filtros.mercado) return false;
      if (filtros.apenasPromocoes && !(produto.desconto && produto.desconto > 0)) return false;

      if (termoBusca) {
        const textoAlvo = normalizarTexto(
          `${produto.nome} ${produto.marca ?? ""} ${produto.descricao ?? ""} ${produto.mercado}`
        );
        if (!textoAlvo.includes(termoBusca)) return false;
      }

      return true;
    });

    return [...filtrados].sort((a, b) => {
      if (filtros.ordenar === "menor_preco") {
        return calcularPrecoFinal(a) - calcularPrecoFinal(b);
      }
      if (filtros.ordenar === "maior_preco") {
        return calcularPrecoFinal(b) - calcularPrecoFinal(a);
      }
      if (filtros.ordenar === "maior_desconto") {
        return (b.desconto ?? 0) - (a.desconto ?? 0);
      }
      const dataA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
      const dataB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
      return dataB - dataA;
    });
  }, [produtos, filtros]);

  const mercadosNoMapa = useMemo<MercadoNoMapa[]>(() => {
    return mercadosDisponiveis
      .map((nome) => {
        const infoApi = mercadosApi.find((m) => m.nome === nome);
        const coordenadas =
          (infoApi ? extrairCoordenadasMercado(infoApi) : undefined) ??
          buscarCoordenadaMercado(nome);

        if (!coordenadas) return null;

        const ofertasDoMercado = produtos.filter((p) => p.mercado === nome);
        const maiorDesconto = ofertasDoMercado.reduce(
          (max, p) => Math.max(max, p.desconto ?? 0),
          0
        );

        return {
          nome,
          coordenadas,
          endereco: infoApi?.endereco,
          horarioFuncionamento: infoApi?.horarioFuncionamento,
          totalOfertas: ofertasDoMercado.length,
          maiorDesconto,
        } as MercadoNoMapa;
      })
      .filter((m): m is MercadoNoMapa => m !== null);
  }, [mercadosDisponiveis, mercadosApi, produtos]);

  const coordenadasFoco = useMemo<Coordenadas>(() => {
    if (!filtros.mercado) {
      return mercadosNoMapa[0]?.coordenadas ?? COORDENADAS_PADRAO;
    }
    const encontrado = mercadosNoMapa.find((m) => m.nome === filtros.mercado);
    return encontrado?.coordenadas ?? COORDENADAS_PADRAO;
  }, [filtros.mercado, mercadosNoMapa]);

  const handleSelecionarMercadoNoMapa = useCallback((nomeMercado: string) => {
    setFiltros((prev) => ({ ...prev, mercado: nomeMercado }));
  }, []);

  return (
    <div className="folheto-page">
      <Header />
      <Filtros
        filtros={filtros}
        categorias={categorias}
        mercados={mercadosDisponiveis}
        totalResultados={produtosFiltrados.length}
        onChange={setFiltros}
        onLimpar={() => setFiltros(FILTROS_INICIAIS)}
      />

      <main className="folheto-conteudo">
        {carregando ? (
          <p className="estado-mensagem">Carregando ofertas...</p>
        ) : erro ? (
          <div className="estado-erro" role="alert">
            <p>{erro}</p>
            <button type="button" onClick={() => void carregarDados()}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {!filtros.mercado && comparacoes.size > 0 && (
              <ComparadorOfertas comparacoes={Array.from(comparacoes.values())} />
            )}
            <ListaProdutosPorCategoria
              produtos={produtosFiltrados}
              categorias={categorias}
              categoriaFiltrada={filtros.categoria || null}
              comparacoes={comparacoes}
            />
          </>
        )}
      </main>

      <MapaMercados
        mercados={mercadosNoMapa}
        coordenadasFoco={coordenadasFoco}
        mercadoSelecionado={filtros.mercado || null}
        onSelecionarMercado={handleSelecionarMercadoNoMapa}
      />
    </div>
  );
}

export default Folheto;
