import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import Header from "../components/Header/Header";
import { useListaCompras } from "../context/ListaComprasContext";
import { listarProdutos } from "../services/api";
import type { Produto } from "../types/produto";
import {
  calcularPrecoFinal,
  formatarMoeda,
  gerarChaveComparacao,
} from "../utils/comparador";
import "./ListaCompras.css";

interface SimulacaoMercado {
  mercado: string;
  total: number;
  itensEncontrados: number;
  totalItens: number;
}

const ListaCompras = () => {
  const { itens, totalUnidades, atualizarQuantidade, removerItem, limparLista } =
    useListaCompras();
  const [catalogo, setCatalogo] = useState<Produto[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    listarProdutos({ limit: 100 }, controller.signal)
      .then((dados) => setCatalogo(dados))
      .catch(() => {
        // se a API estiver indisponível, usa apenas os itens já salvos na lista
      });
    return () => controller.abort();
  }, []);

  const totalAtual = useMemo(
    () =>
      itens.reduce(
        (soma, item) => soma + calcularPrecoFinal(item.produto) * item.quantidade,
        0
      ),
    [itens]
  );

  const analiseEconomia = useMemo(() => {
    if (itens.length === 0) {
      return {
        planoEconomico: [] as Array<{
          nome: string;
          quantidade: number;
          mercadoEscolhido: string;
          precoUnitario: number;
          subtotal: number;
        }>,
        totalEconomico: 0,
        economiaSobreAtual: 0,
        simulacoesPorMercado: [] as SimulacaoMercado[],
      };
    }

    const todosProdutos = catalogo.length > 0 ? catalogo : itens.map((i) => i.produto);
    const ofertasPorChave = new Map<string, Produto[]>();

    for (const p of todosProdutos) {
      const chave = gerarChaveComparacao(p);
      const lista = ofertasPorChave.get(chave) ?? [];
      lista.push(p);
      ofertasPorChave.set(chave, lista);
    }

    const mercadosSet = new Set(todosProdutos.map((p) => p.mercado));

    const planoEconomico = itens.map((item) => {
      const chave = gerarChaveComparacao(item.produto);
      const equivalentes = ofertasPorChave.get(chave) ?? [item.produto];
      const melhor = equivalentes.reduce((menor, atual) =>
        calcularPrecoFinal(atual) < calcularPrecoFinal(menor) ? atual : menor
      );
      const precoUnitario = calcularPrecoFinal(melhor);
      return {
        nome: item.produto.nome,
        quantidade: item.quantidade,
        mercadoEscolhido: melhor.mercado,
        precoUnitario,
        subtotal: precoUnitario * item.quantidade,
      };
    });

    const totalEconomico = planoEconomico.reduce((acc, p) => acc + p.subtotal, 0);
    const economiaSobreAtual = Math.max(0, Number((totalAtual - totalEconomico).toFixed(2)));

    const simulacoesPorMercado: SimulacaoMercado[] = Array.from(mercadosSet)
      .map((mercado) => {
        let total = 0;
        let itensEncontrados = 0;

        for (const item of itens) {
          const chave = gerarChaveComparacao(item.produto);
          const equivalentes = ofertasPorChave.get(chave) ?? [];
          const noMercado = equivalentes
            .filter((p) => p.mercado === mercado)
            .sort((a, b) => calcularPrecoFinal(a) - calcularPrecoFinal(b))[0];

          if (noMercado) {
            total += calcularPrecoFinal(noMercado) * item.quantidade;
            itensEncontrados += 1;
          }
        }

        return {
          mercado,
          total,
          itensEncontrados,
          totalItens: itens.length,
        };
      })
      .filter((s) => s.itensEncontrados > 0)
      .sort((a, b) => {
        if (b.itensEncontrados !== a.itensEncontrados) {
          return b.itensEncontrados - a.itensEncontrados;
        }
        return a.total - b.total;
      });

    return {
      planoEconomico,
      totalEconomico,
      economiaSobreAtual,
      simulacoesPorMercado,
    };
  }, [itens, catalogo, totalAtual]);

  return (
    <div className="lista-compras-page">
      <Header />

      <main className="lista-compras-container">
        <div className="lista-topo">
          <div>
            <h2>Minha Lista de Compras</h2>
            <p className="lista-subtitulo">
              {totalUnidades === 0
                ? "Adicione ofertas do folheto para simular onde sua compra sai mais barata."
                : `${itens.length} produto(s) · ${totalUnidades} unidade(s)`}
            </p>
          </div>
          {itens.length > 0 && (
            <button type="button" className="btn-limpar-lista" onClick={limparLista}>
              Limpar lista
            </button>
          )}
        </div>

        {itens.length === 0 ? (
          <div className="lista-vazia">
            <p>Sua lista de compras ainda está vazia.</p>
            <Link to="/" className="btn-voltar-ofertas">
              Explorar ofertas
            </Link>
          </div>
        ) : (
          <div className="lista-layout">
            <section className="lista-itens" aria-label="Itens da lista">
              {itens.map((item) => {
                const precoUnit = calcularPrecoFinal(item.produto);
                return (
                  <article key={item.id} className="item-lista-card">
                    <div className="item-info">
                      <h3>{item.produto.nome}</h3>
                      <p className="item-mercado">
                        {item.produto.mercado}
                        {item.produto.marca ? ` • ${item.produto.marca}` : ""}
                      </p>
                      <p className="item-preco-unit">
                        {formatarMoeda(precoUnit)} cada
                      </p>
                    </div>

                    <div className="item-controles">
                      <div className="item-stepper">
                        <button
                          type="button"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                          aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                        >
                          −
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                          aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                        >
                          +
                        </button>
                      </div>

                      <strong className="item-subtotal">
                        {formatarMoeda(precoUnit * item.quantidade)}
                      </strong>

                      <button
                        type="button"
                        className="btn-remover-item"
                        onClick={() => removerItem(item.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="lista-resumo" aria-label="Simulador de economia">
              <div className="resumo-card">
                <h3>Resumo da Compra</h3>
                <div className="resumo-linha">
                  <span>Total conforme selecionado</span>
                  <strong>{formatarMoeda(totalAtual)}</strong>
                </div>
                <div className="resumo-linha destaque-economia">
                  <span>Plano Econômico (menor preço por item)</span>
                  <strong>{formatarMoeda(analiseEconomia.totalEconomico)}</strong>
                </div>

                {analiseEconomia.economiaSobreAtual > 0 && (
                  <p className="banner-economia">
                    Você economiza{" "}
                    <strong>{formatarMoeda(analiseEconomia.economiaSobreAtual)}</strong>{" "}
                    comprando cada item no mercado mais barato!
                  </p>
                )}
              </div>

              {analiseEconomia.simulacoesPorMercado.length > 0 && (
                <div className="resumo-card">
                  <h3>Comprando tudo em um único mercado</h3>
                  <ul className="simulacao-mercados">
                    {analiseEconomia.simulacoesPorMercado.map((sim, idx) => (
                      <li
                        key={sim.mercado}
                        className={
                          idx === 0 && sim.itensEncontrados === sim.totalItens
                            ? "mercado-recomendado"
                            : ""
                        }
                      >
                        <div>
                          <strong>{sim.mercado}</strong>
                          <span className="cobertura-itens">
                            {sim.itensEncontrados}/{sim.totalItens} item(ns) disponíveis
                          </span>
                        </div>
                        <strong>{formatarMoeda(sim.total)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="resumo-card">
                <h3>Onde comprar cada item</h3>
                <ul className="plano-itens">
                  {analiseEconomia.planoEconomico.map((p, idx) => (
                    <li key={`${p.nome}-${idx}`}>
                      <span>
                        {p.quantidade}x {p.nome} <em>({p.mercadoEscolhido})</em>
                      </span>
                      <strong>{formatarMoeda(p.subtotal)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default ListaCompras;
