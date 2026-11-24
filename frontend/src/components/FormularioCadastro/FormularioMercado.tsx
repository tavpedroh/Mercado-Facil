import { useState, type ChangeEvent, type FormEvent } from "react";
import Input from "../Input/Input";
import { cadastrarMercado } from "../../services/api";
import "./FormularioCadastro.css";

const ESTADO_INICIAL = {
  nome: "",
  endereco: "",
  telefone: "",
  horarioFuncionamento: "",
  lat: "",
  lng: "",
};

const FormularioMercado = () => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(
    null
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const temLat = formData.lat.trim() !== "";
    const temLng = formData.lng.trim() !== "";
    if (temLat !== temLng) {
      setFeedback({
        tipo: "erro",
        mensagem: "Informe tanto a latitude quanto a longitude, ou deixe ambas em branco.",
      });
      return;
    }

    let coordenadas: { lat: number; lng: number } | undefined;
    if (temLat && temLng) {
      const lat = Number.parseFloat(formData.lat);
      const lng = Number.parseFloat(formData.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        setFeedback({ tipo: "erro", mensagem: "Coordenadas inválidas." });
        return;
      }
      coordenadas = { lat, lng };
    }

    setEnviando(true);
    try {
      await cadastrarMercado({
        nome: formData.nome.trim(),
        endereco: formData.endereco.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        horarioFuncionamento: formData.horarioFuncionamento.trim() || undefined,
        coordenadas,
      });

      setFeedback({ tipo: "sucesso", mensagem: "Mercado cadastrado com sucesso!" });
      setFormData(ESTADO_INICIAL);
    } catch (error) {
      const mensagem =
        error instanceof Error ? error.message : "Erro ao cadastrar mercado.";
      setFeedback({ tipo: "erro", mensagem });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="formulario-cadastro" onSubmit={handleSubmit}>
      <h2>Cadastrar Mercado</h2>

      {feedback && (
        <div
          className={`feedback feedback-${feedback.tipo}`}
          role={feedback.tipo === "erro" ? "alert" : "status"}
        >
          {feedback.mensagem}
        </div>
      )}

      <Input
        label="Nome do Mercado"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        placeholder="Ex: Supermercado Central"
        required
      />
      <Input
        label="Endereço"
        name="endereco"
        value={formData.endereco}
        onChange={handleChange}
        placeholder="Rua, número e bairro (opcional)"
      />
      <Input
        label="Telefone"
        name="telefone"
        value={formData.telefone}
        onChange={handleChange}
        placeholder="(11) 99999-9999 (opcional)"
      />
      <Input
        label="Horário de Funcionamento"
        name="horarioFuncionamento"
        value={formData.horarioFuncionamento}
        onChange={handleChange}
        placeholder="Ex: Seg a Sáb, 08h às 21h (opcional)"
      />
      <div className="campos-coordenadas">
        <Input
          label="Latitude (opcional)"
          name="lat"
          type="number"
          step="any"
          value={formData.lat}
          onChange={handleChange}
          placeholder="-23.5505"
        />
        <Input
          label="Longitude (opcional)"
          name="lng"
          type="number"
          step="any"
          value={formData.lng}
          onChange={handleChange}
          placeholder="-46.6333"
        />
      </div>

      <button type="submit" disabled={enviando}>
        {enviando ? "Cadastrando..." : "Cadastrar Mercado"}
      </button>
    </form>
  );
};

export default FormularioMercado;
