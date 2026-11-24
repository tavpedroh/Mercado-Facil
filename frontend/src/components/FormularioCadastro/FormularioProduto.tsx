<<<<<<< HEAD:frontend/src/components/FormularioProduto/FormularioProduto.tsx
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import Input from "../Input/Input";
import Select from "../Select/Select";
import { CATEGORIAS, MERCADOS as MERCADOS_PADRAO } from "../../constants/mercados";
import { cadastrarProduto, listarMercados } from "../../services/api";
import {
  UNIDADES_PRODUTO,
  type Mercado,
  type UnidadeProduto,
} from "../../types/produto";
import "./FormularioProduto.css";

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

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const FormularioProduto = () => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [mercadosApi, setMercadosApi] = useState<Mercado[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();
    listarMercados(controller.signal)
      .then((dados) => setMercadosApi(dados))
      .catch(() => {
        // mantém fallback local se a API ainda não tiver mercados cadastrados ou estiver offline
      });
    return () => controller.abort();
  }, []);

  const opcoesMercados =
    mercadosApi.length > 0 ? mercadosApi.map((m) => m.nome) : MERCADOS_PADRAO;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
=======
import React, { useState, useEffect } from "react";
import Input from "../Input/Input";
import Select, { OpcaoSelect } from "../Select/Select"; // Importamos o molde universal e sua estrutura
import "./FormularioCadastro.css";
import { buscarCategorias, buscarMercados } from "../../services/api"; 

const FormularioProduto = () => {

  const [categorias, setCategorias] = useState<string[]>([]);
  const [mercados, setMercados] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    desconto: "",
    categoria: "",
    mercado: "",
  });

  useEffect(() => {
    buscarCategorias().then((dados) => setCategorias(dados));
    buscarMercados().then((dados) => setMercados(dados));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b:frontend/src/components/FormularioCadastro/FormularioProduto.tsx
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
<<<<<<< HEAD:frontend/src/components/FormularioProduto/FormularioProduto.tsx
    setFeedback(null);

    if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      setFeedback({ tipo: "erro", mensagem: "Informe um preço válido maior que zero." });
      return;
    }
=======
    const produto = {
      ...formData,
      preco: parseFloat(formData.preco),
      desconto: formData.desconto ? parseFloat(formData.desconto) : 0,
    };
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b:frontend/src/components/FormularioCadastro/FormularioProduto.tsx

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

<<<<<<< HEAD:frontend/src/components/FormularioProduto/FormularioProduto.tsx
      setFeedback({ tipo: "sucesso", mensagem: "Produto cadastrado com sucesso!" });
      setFormData(ESTADO_INICIAL);
=======
      if (resposta.ok) {
        alert("Produto cadastrado com sucesso!");
        setFormData({ nome: "", descricao: "", preco: "", desconto: "", categoria: "", mercado: "" });
      } else {
        alert("Erro ao cadastrar o produto.");
      }
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b:frontend/src/components/FormularioCadastro/FormularioProduto.tsx
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao conectar com o servidor.";
      setFeedback({ tipo: "erro", mensagem });
    } finally {
      setEnviando(false);
    }
  }
  // Transformamos as palavras simples nas "fichas duplas" exigidas pelo novo molde
  const opcoesCategorias: OpcaoSelect[] = categorias.map((cat) => ({ valor: cat, rotulo: cat }));
  const opcoesMercados: OpcaoSelect[] = mercados.map((merc) => ({ valor: merc, rotulo: merc }));

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
<<<<<<< HEAD:frontend/src/components/FormularioProduto/FormularioProduto.tsx

      {precoFinalPrevia !== null && (
        <p className="previa-preco">
          Preço final com desconto: <strong>{formatarMoeda(precoFinalPrevia)}</strong>
        </p>
      )}

      <Select
        label="Categoria"
        name="categoria"
        options={CATEGORIAS}
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
        {enviando ? "Cadastrando..." : "Cadastrar"}
      </button>
=======
      
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
      
      <button type="submit">Cadastrar</button>
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b:frontend/src/components/FormularioCadastro/FormularioProduto.tsx
    </form>
  );
};

export default FormularioProduto;