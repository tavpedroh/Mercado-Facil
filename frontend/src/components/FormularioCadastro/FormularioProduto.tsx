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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const produto = {
      ...formData,
      preco: parseFloat(formData.preco),
      desconto: formData.desconto ? parseFloat(formData.desconto) : 0,
    };

    try {
      const resposta = await fetch("http://localhost:3000/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produto),
      });

      if (resposta.ok) {
        alert("Produto cadastrado com sucesso!");
        setFormData({ nome: "", descricao: "", preco: "", desconto: "", categoria: "", mercado: "" });
      } else {
        alert("Erro ao cadastrar o produto.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  }
  // Transformamos as palavras simples nas "fichas duplas" exigidas pelo novo molde
  const opcoesCategorias: OpcaoSelect[] = categorias.map((cat) => ({ valor: cat, rotulo: cat }));
  const opcoesMercados: OpcaoSelect[] = mercados.map((merc) => ({ valor: merc, rotulo: merc }));

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Cadastrar Produto</h2>
      <Input
        label="Nome do Produto"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        required
      />
      <Input
        label="Descrição"
        name="descricao"
        value={formData.descricao}
        onChange={handleChange}
      />
      <Input
        label="Preço (R$)"
        name="preco"
        type="number"
        value={formData.preco}
        onChange={handleChange}
        required
      />
      <Input
        label="Desconto (%)"
        name="desconto"
        type="number"
        value={formData.desconto}
        onChange={handleChange}
      />
      
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
    </form>
  );
};

export default FormularioProduto;