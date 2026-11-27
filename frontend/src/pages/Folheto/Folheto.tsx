import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import Header from "../../components/Header/Header";
import VitrineDestaques from "../../components/VitrineDestaques/VitrineDestaques";
import Filtros, { type EstadoFiltros } from "../../components/Filtros/Filtros";
import ComparadorOfertas from "../../components/ComparadorOfertas/ComparadorOfertas";
import ListaProdutosPorCategoria from "../../components/ListaProdutosPorCategoria/ListaProdutosPorCategoria";
import DetalhamentoProduto from "../../components/DetalhamentoProduto/DetalhamentoProduto";
import MapaMercados, { type MercadoNoMapa } from "../../components/MapaMercados/MapaMercados";
import {
  buscarCoordenadaMercado,
  COORDENADAS_PADRAO,
  MERCADOS as MERCADOS_PADRAO,
} from "../../constants/mercados";
import { useFavoritos } from "../../context/FavoritosContext";
import {
  cadastrarAlerta,
  listarAlertasDisparados,
  listarCategorias,
  listarMercados,
  listarProdutos,
  obterResumoEstatisticas,
} from "../../services/api";
import type {
  AlertaDisparado,
  Categoria,
  Coordenadas,
  Mercado,
  Produto,
  ResumoEstatisticas,
} from "../../types/produto";
import {
  construirMapaComparacoes,
  formatarMoeda,
} from "../../utils/comparador";
import { filtrarEOrdenarOfertas } from "../../utils/filtrosOfertas";
import "./Folheto.css";

const FILTROS_INICIAIS: EstadoFiltros = {
  busca: "",
  categoria: "",
  mercado: "",
  ordenar: "recentes",
  apenasPromocoes: false,
  apenasAtivas: false,
  apenasFavoritos: false,
  precoMin: "",
  precoMax: "",
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

function Folheto() {
  const { hash } = useLocation();
  const { favoritosIds, totalFavoritos } = useFavoritos();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mercadosApi, setMercadosApi] = useState<Mercado[]>([]);
  const [categoriasApi, setCategoriasApi] = useState<Categoria[]>([]);
  const [estatisticas, setEstatisticas] = useState<ResumoEstatisticas | null>(null);
  const [alertasDisparados, setAlertasDisparados] = useState<AlertaDisparado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<EstadoFiltros>(FILTROS_INICIAIS);
  const [produtoDetalhe, setProdutoDetalhe] = useState<Produto | null>(null);

  const [alertaTermo, setAlertaTermo] = useState("");
  const [alertaPreco, setAlertaPreco] = useState("");
  const [salvandoAlerta, setSalvandoAlerta] = useState(false);
  const [feedbackAlerta, setFeedbackAlerta] = useState<string | null>(null);

  const carregarDados = useCallback(async (signal?: AbortSignal) => {
    setCarregando(true);
    setErro(null);
    try {
      const [dadosProdutos, dadosMercados, dadosCategorias, dadosStats, dadosAlertas] =
        await Promise.all([
          listarProdutos({ limit: 100 }, signal),
          listarMercados(signal).catch(() => [] as Mercado[]),
          listarCategorias(signal).catch(() => [] as Categoria[]),
          obterResumoEstatisticas(signal).catch(() => null),
          listarAlertasDisparados(signal).catch(() => [] as AlertaDisparado[]),
        ]);
      setProdutos(dadosProdutos);
      setMercadosApi(dadosMercados);
      setCategoriasApi(dadosCategorias);
      setEstatisticas(dadosStats);
      setAlertasDisparados(dadosAlertas);
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
    () =>
      Array.from(
        new Set([
          ...categoriasApi.map((c) => c.nome),
          ...produtos.map((p) => p.categoria || "Sem categoria"),
        ])
      ),
    [categoriasApi, produtos]
  );

  const mercadosDisponiveis = useMemo(
    () =>
      mercadosApi.length > 0
        ? Array.from(new Set([...mercadosApi.map((m) => m.nome), ...produtos.map((p) => p.mercado)]))
        : Array.from(new Set([...MERCADOS_PADRAO, ...produtos.map((p) => p.mercado)])),
    [mercadosApi, produtos]
  );

  const produtosFiltrados = useMemo(() => {
    const precoMinNum = filtros.precoMin.trim() !== "" ? Number(filtros.precoMin) : undefined;
    const precoMaxNum = filtros.precoMax.trim() !== "" ? Number(filtros.precoMax) : undefined;

    return filtrarEOrdenarOfertas(produtos, {
      busca: filtros.busca,
      categoria: filtros.categoria || undefined,
      mercado: filtros.mercado || undefined,
      apenasPromocoes: filtros.apenasPromocoes,
      apenasAtivas: filtros.apenasAtivas,
      apenasFavoritos: filtros.apenasFavoritos,
      favoritosIds,
      precoMin: precoMinNum !== undefined && !Number.isNaN(precoMinNum) ? precoMinNum : undefined,
      precoMax: precoMaxNum !== undefined && !Number.isNaN(precoMaxNum) ? precoMaxNum : undefined,
      ordenar: filtros.ordenar,
    });
  }, [produtos, filtros, favoritosIds]);

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

  const handleCriarAlerta = async (e: FormEvent) => {
    e.preventDefault();
    const precoAlvo = Number(alertaPreco);
    if (alertaTermo.trim().length < 2 || Number.isNaN(precoAlvo) || precoAlvo <= 0) {
      setFeedbackAlerta("Informe o nome do produto e um preço-alvo válido.");
      return;
    }

    setSalvandoAlerta(true);
    setFeedbackAlerta(null);
    try {
      await cadastrarAlerta({
        termoProduto: alertaTermo.trim(),
        precoAlvo,
      });
      setAlertaTermo("");
      setAlertaPreco("");
      const atualizados = await listarAlertasDisparados().catch(() => alertasDisparados);
      setAlertasDisparados(atualizados);
      setFeedbackAlerta("Alerta de preço-alvo salvo com sucesso!");
    } catch (err) {
      setFeedbackAlerta(err instanceof Error ? err.message : "Erro ao salvar alerta.");
    } finally {
      setSalvandoAlerta(false);
    }
  };

  const mercadoDestaque = estatisticas?.rankingMercados[0];

  return (
    <div className="folheto-page">
      <Header />
      <Filtros
        filtros={filtros}
        categorias={categorias}
        mercados={mercadosDisponiveis}
        totalResultados={produtosFiltrados.length}
        totalFavoritos={totalFavoritos}
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
            {(estatisticas || alertasDisparados.length > 0) && (
              <section className="painel-insights" aria-label="Resumo de economia e alertas">
                {estatisticas && (
                  <div className="insights-metricas">
                    <div className="metrica-card">
                      <span>Ofertas ativas</span>
                      <strong>{estatisticas.totalOfertasAtivas}</strong>
                    </div>
                    <div className="metrica-card">
                      <span>Desconto médio</span>
                      <strong>{estatisticas.descontoMedio}%</strong>
                    </div>
                    {mercadoDestaque && (
                      <div className="metrica-card">
                        <span>Destaque em descontos</span>
                        <strong>{mercadoDestaque.mercado}</strong>
                      </div>
                    )}
                    <div className="metrica-card">
                      <span>Alertas atingidos</span>
                      <strong>{alertasDisparados.length}</strong>
                    </div>
                  </div>
                )}

                {alertasDisparados.length > 0 && (
                  <div className="alertas-disparados-box">
                    <strong>Alertas de preço atingidos:</strong>
                    <ul>
                      {alertasDisparados.slice(0, 3).map((item) => (
                        <li key={item.alerta._id}>
                          <span>
                            {item.alerta.termoProduto} (alvo{" "}
                            {formatarMoeda(item.alerta.precoAlvo)})
                          </span>
                          <strong>
                            Melhor oferta: {formatarMoeda(item.melhorPreco)}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <form className="form-alerta-rapido" onSubmit={(e) => void handleCriarAlerta(e)}>
                  <span>Criar alerta de preço-alvo:</span>
                  <input
                    type="text"
                    placeholder="Ex.: Arroz 5kg"
                    value={alertaTermo}
                    onChange={(e) => setAlertaTermo(e.target.value)}
                    aria-label="Produto para alerta de preço"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Preço-alvo R$"
                    value={alertaPreco}
                    onChange={(e) => setAlertaPreco(e.target.value)}
                    aria-label="Preço-alvo em reais"
                  />
                  <button type="submit" disabled={salvandoAlerta}>
                    {salvandoAlerta ? "Salvando..." : "Criar alerta"}
                  </button>
                  {feedbackAlerta && <small className="feedback-alerta">{feedbackAlerta}</small>}
                </form>
              </section>
            )}

            {!filtros.busca &&
              !filtros.categoria &&
              !filtros.mercado &&
              !filtros.apenasFavoritos && (
                <VitrineDestaques
                  produtos={produtos}
                  comparacoes={comparacoes}
                  aoSelecionarProduto={setProdutoDetalhe}
                />
              )}
            {!filtros.mercado && comparacoes.size > 0 && (
              <ComparadorOfertas comparacoes={Array.from(comparacoes.values())} />
            )}
            <ListaProdutosPorCategoria
              produtos={produtosFiltrados}
              categorias={categorias}
              categoriaFiltrada={filtros.categoria || null}
              comparacoes={comparacoes}
              aoSelecionarProduto={setProdutoDetalhe}
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

      {produtoDetalhe && (
        <DetalhamentoProduto
          produto={produtoDetalhe}
          todosOsProdutos={produtos}
          aoFechar={() => setProdutoDetalhe(null)}
        />
      )}
    </div>
  );
}

export default Folheto;
