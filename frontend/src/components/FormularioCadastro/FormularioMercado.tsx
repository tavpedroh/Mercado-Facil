import React, { useState } from "react";
import Input from "../Input/Input";
import "./FormularioCadastro.css";

const FormularioMercado = () => {
  const [nome, setNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const resposta = await fetch("http://localhost:3000/mercados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (resposta.ok) {
        alert("Mercado cadastrado com sucesso!");
        setNome("");
      } else {
        alert("Erro ao cadastrar o mercado.");
      }
    } catch (error) {
      console.error("Erro na requisição de mercado:", error);
    }
  };

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Novo Mercado</h2>
      <Input
        label="Nome do Mercado"
        name="nomeMercado"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />
      <button type="submit">Cadastrar Mercado</button>
    </form>
  );
};

export default FormularioMercado;