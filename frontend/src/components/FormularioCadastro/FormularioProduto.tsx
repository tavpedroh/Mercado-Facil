import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Input from "../Input/Input";
import Select from "../Select/Select";
import { CATEGORIAS as CATEGORIAS_PADRAO, MERCADOS as MERCADOS_PADRAO } from "../../constants/mercados";
import { cadastrarProduto, listarCategorias, listarMercados } from "../../services/api";
import {
  UNIDADES_PRODUTO,
  type Categoria,
  type Mercado,
  type UnidadeProduto,
} from "../../types/produto";
import { formatarMoeda } from "../../utils/comparador";
import "./FormularioCadastro.css";

const ESTADO_INICIAL = {
  nome: "",
  marca: "",
  descricao: "",
  unidade: "un" as UnidadeProduto,
  preco: "",
  desconto: "",
  categoria: "",
  mercado: "",
};

const FormularioProduto = () => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [categoriasApi, setCategoriasApi] = useState<Categoria[]>([]);
  const [mercadosApi, setMercadosApi] = useState<Mercado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listarCategorias(controller.signal).catch(() => [] as Categoria[]),
      listarMercados(controller.signal).catch(() => [] as Mercado[]),
    ]).then(([cats, mercs]) => {
      if (!controller.signal.aborted) {
        setCategoriasApi(cats);
        setMercadosApi(mercs);
      }
    });
    return () => controller.abort();
  }, []);

  const opcoesCategorias =
    categoriasApi.length > 0 ? categoriasApi.map((c) => c.nome) : CATEGORIAS_PADRAO;
  const opcoesMercados =
    mercadosApi.length > 0 ? mercadosApi.map((m) => m.nome) : MERCADOS_PADRAO;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const precoNumero = Number.parseFloat(formData.preco);
  const descontoNumero = formData.desconto ? Number.parseFloat(formData.desconto) : 0;
  const mostrarPrevia =
    !Number.isNaN(precoNumero) &&
    precoNumero > 0 &&
    !Number.isNaN(descontoNumero) &&
    descontoNumero > 0 &&
    descontoNumero <= 100;
  const precoFinalPrevia = mostrarPrevia
    ? precoNumero - (precoNumero * descontoNumero) / 100
    : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      setFeedback({ tipo: "erro", mensagem: "Informe um preço válido maior que zero." });
      return;
    }

    if (Number.isNaN(descontoNumero) || descontoNumero < 0 || descontoNumero > 100) {
      setFeedback({ tipo: "erro", mensagem: "O desconto deve estar entre 0% e 100%." });
      return;
    }

    const mercadoVinculado = mercadosApi.find((m) => m.nome === formData.mercado);

    setEnviando(true);
    try {
      await cadastrarProduto({
        nome: formData.nome.trim(),
        marca: formData.marca.trim() || undefined,
        descricao: formData.descricao.trim() || undefined,
        unidade: formData.unidade,
        preco: precoNumero,
        desconto: descontoNumero,
        categoria: formData.categoria,
        mercado: formData.mercado,
        mercadoId: mercadoVinculado?._id,
      });

      setFeedback({ tipo: "sucesso", mensagem: "Produto cadastrado com sucesso!" });
      setFormData(ESTADO_INICIAL);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao conectar com o servidor.";
      setFeedback({ tipo: "erro", mensagem });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Cadastrar Produto</h2>

      {feedback && (
        <div
          className={`feedback feedback-${feedback.tipo}`}
          role={feedback.tipo === "erro" ? "alert" : "status"}
        >
          {feedback.mensagem}
        </div>
      )}

      <Input
        label="Nome do Produto"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        placeholder="Ex: Arroz Tipo 1 5kg"
        required
      />
      <Input
        label="Marca"
        name="marca"
        value={formData.marca}
        onChange={handleChange}
        placeholder="Ex: Camil (opcional)"
      />
      <Input
        label="Descrição"
        name="descricao"
        value={formData.descricao}
        onChange={handleChange}
        placeholder="Detalhes opcionais (peso, validade)"
      />
      <Select
        label="Unidade"
        name="unidade"
        options={UNIDADES_PRODUTO}
        value={formData.unidade}
        onChange={handleChange}
        required
      />
      <Input
        label="Preço (R$)"
        name="preco"
        type="number"
        min="0.01"
        step="0.01"
        value={formData.preco}
        onChange={handleChange}
        placeholder="0,00"
        required
      />
      <Input
        label="Desconto (%)"
        name="desconto"
        type="number"
        min="0"
        max="100"
        step="1"
        value={formData.desconto}
        onChange={handleChange}
        placeholder="0"
      />

      {precoFinalPrevia !== null && (
        <p className="previa-preco">
          Preço final com desconto: <strong>{formatarMoeda(precoFinalPrevia)}</strong>
        </p>
      )}

      <Select
        label="Categoria"
        name="categoria"
        options={opcoesCategorias}
        value={formData.categoria}
        onChange={handleChange}
        required
      />
      <Select
        label="Mercado"
        name="mercado"
        options={opcoesMercados}
        value={formData.mercado}
        onChange={handleChange}
        required
      />

      <button type="submit" disabled={enviando}>
        {enviando ? "Cadastrando..." : "Cadastrar Produto"}
      </button>
    </form>
  );
};

export default FormularioProduto;
