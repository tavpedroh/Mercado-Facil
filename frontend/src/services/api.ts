import type {
  AlertaDisparado,
  AlertaPreco,
  Categoria,
  FiltrosProdutosQuery,
  Mercado,
  NovaCategoriaPayload,
  NovoAlertaPayload,
  NovoMercadoPayload,
  NovoProdutoPayload,
  Produto,
  RespostaProdutos,
  ResumoEstatisticas,
} from "../types/produto";

const API_BASE_URL = (import.meta.env?.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

interface ErroApiPayload {
  erro?: string;
  message?: string;
  detalhes?: Array<{ campo?: string; mensagem?: string }>;
}

async function handleResponse<T>(response: Response, mensagemErroPadrao: string): Promise<T> {
  if (!response.ok) {
    let mensagem = "";
    try {
      const body = (await response.json()) as ErroApiPayload;
      const detalheTexto = body.detalhes
        ?.map((d) => (d.campo && d.campo !== "geral" ? `${d.campo}: ${d.mensagem}` : d.mensagem))
        .filter(Boolean)
        .join(" | ");
      mensagem = detalheTexto
        ? `${body.erro || mensagemErroPadrao} (${detalheTexto})`
        : body.erro || body.message || "";
    } catch {
      // ignora erro ao ler JSON de resposta de erro
    }
    throw new Error(mensagem || `${mensagemErroPadrao} (HTTP ${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function montarQueryString(params?: FiltrosProdutosQuery): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== "") {
      search.set(chave, String(valor));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function listarProdutos(
  params?: FiltrosProdutosQuery,
  signal?: AbortSignal
): Promise<Produto[]> {
  const response = await fetch(`${API_BASE_URL}/produtos${montarQueryString(params)}`, { signal });
  const body = await handleResponse<RespostaProdutos | Produto[]>(
    response,
    "Erro ao buscar produtos"
  );
  return Array.isArray(body) ? body : body.dados;
}

export async function cadastrarProduto(produto: NovoProdutoPayload): Promise<Produto> {
  const response = await fetch(`${API_BASE_URL}/produtos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(produto),
  });
  return handleResponse<Produto>(response, "Erro ao cadastrar produto");
}

export async function atualizarProduto(
  id: string,
  dados: Partial<NovoProdutoPayload>
): Promise<Produto> {
  const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return handleResponse<Produto>(response, "Erro ao atualizar produto");
}

export async function removerProduto(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response, "Erro ao remover produto");
}

export async function listarMercados(signal?: AbortSignal): Promise<Mercado[]> {
  const response = await fetch(`${API_BASE_URL}/mercados`, { signal });
  return handleResponse<Mercado[]>(response, "Erro ao buscar mercados");
}

export async function cadastrarMercado(mercado: NovoMercadoPayload): Promise<Mercado> {
  const response = await fetch(`${API_BASE_URL}/mercados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mercado),
  });
  return handleResponse<Mercado>(response, "Erro ao cadastrar mercado");
}

export async function listarCategorias(signal?: AbortSignal): Promise<Categoria[]> {
  const response = await fetch(`${API_BASE_URL}/categorias`, { signal });
  return handleResponse<Categoria[]>(response, "Erro ao buscar categorias");
}

export async function cadastrarCategoria(categoria: NovaCategoriaPayload): Promise<Categoria> {
  const response = await fetch(`${API_BASE_URL}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoria),
  });
  return handleResponse<Categoria>(response, "Erro ao cadastrar categoria");
}

export async function listarAlertas(signal?: AbortSignal): Promise<AlertaPreco[]> {
  const response = await fetch(`${API_BASE_URL}/alertas`, { signal });
  return handleResponse<AlertaPreco[]>(response, "Erro ao buscar alertas");
}

export async function listarAlertasDisparados(signal?: AbortSignal): Promise<AlertaDisparado[]> {
  const response = await fetch(`${API_BASE_URL}/alertas/disparados`, { signal });
  return handleResponse<AlertaDisparado[]>(response, "Erro ao verificar alertas disparados");
}

export async function cadastrarAlerta(alerta: NovoAlertaPayload): Promise<AlertaPreco> {
  const response = await fetch(`${API_BASE_URL}/alertas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alerta),
  });
  return handleResponse<AlertaPreco>(response, "Erro ao cadastrar alerta");
}

export async function removerAlerta(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/alertas/${id}`, {
    method: "DELETE",
  });
  await handleResponse<void>(response, "Erro ao remover alerta");
}

export async function obterResumoEstatisticas(signal?: AbortSignal): Promise<ResumoEstatisticas> {
  const response = await fetch(`${API_BASE_URL}/estatisticas/resumo`, { signal });
  return handleResponse<ResumoEstatisticas>(response, "Erro ao carregar estatísticas");
}
