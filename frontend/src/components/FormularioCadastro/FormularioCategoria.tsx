import React, { useState } from "react";
import Input from "../Input/Input";
import "./FormularioCadastro.css"; 

const FormularioCategoria = () => {
  const [nome, setNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resposta = await fetch("http://localhost:3000/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (resposta.ok) {
        alert("Categoria cadastrada com sucesso!");
        setNome("");
      } else {
        alert("Erro ao cadastrar a categoria.");
      }
    } catch (error) {
      console.error("Erro na requisição de categoria:", error);
    }
  };

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Nova Categoria</h2>
      <Input
        label="Nome da Categoria"
        name="nomeCategoria"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <button type="submit">Cadastrar Categoria</button>
    </form>
  );
};

export default FormularioCategoria;