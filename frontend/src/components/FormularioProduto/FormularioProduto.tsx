import React, { useState } from "react";
import Input from "../Input/Input";
import Select from "../Select/Select";
import "./FormularioProduto.css";

const categorias = ["Alimentos", "Bebidas", "Limpeza", "Higiene"];
const mercados = ["Mercado A", "Mercado B", "Mercado C"];

const FormularioProduto = () => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    desconto: "",
    categoria: "",
    mercado: "",
  });

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
        setFormData({
          nome: "",
          descricao: "",
          preco: "",
          desconto: "",
          categoria: "",
          mercado: "",
        });
      } else {
        alert("Erro ao cadastrar o produto.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <form className="formulario-produto" onSubmit={handleSubmit}>
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
        options={categorias}
        value={formData.categoria}
        onChange={handleChange}
        required
      />
      <Select
        label="Mercado"
        name="mercado"
        options={mercados}
        value={formData.mercado}
        onChange={handleChange}
        required
      />
      <button type="submit">Cadastrar</button>
    </form>
  );
};

export default FormularioProduto;
