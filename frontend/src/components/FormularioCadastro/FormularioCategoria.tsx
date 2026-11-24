import { useState, type ChangeEvent, type FormEvent } from "react";
import Input from "../Input/Input";
import { cadastrarCategoria } from "../../services/api";
import "./FormularioCadastro.css";

const FormularioCategoria = () => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(
    null
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setEnviando(true);

    try {
      await cadastrarCategoria({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
      });
      setFeedback({ tipo: "sucesso", mensagem: "Categoria cadastrada com sucesso!" });
      setNome("");
      setDescricao("");
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao cadastrar categoria.";
      setFeedback({ tipo: "erro", mensagem });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Cadastrar Categoria</h2>

      {feedback && (
        <div
          className={`feedback feedback-${feedback.tipo}`}
          role={feedback.tipo === "erro" ? "alert" : "status"}
        >
          {feedback.mensagem}
        </div>
      )}

      <Input
        label="Nome da Categoria"
        name="nomeCategoria"
        value={nome}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
        placeholder="Ex: Hortifruti"
        required
      />
      <Input
        label="Descrição"
        name="descricaoCategoria"
        value={descricao}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDescricao(e.target.value)}
        placeholder="Descrição opcional da categoria"
      />

      <button type="submit" disabled={enviando}>
        {enviando ? "Cadastrando..." : "Cadastrar Categoria"}
      </button>
    </form>
  );
};

export default FormularioCategoria;
