import type { ChangeEvent } from "react";
import "./Select.css";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps {
  label: string;
  name: string;
<<<<<<< HEAD
  options: readonly string[];
=======
  options: OpcaoSelect[];
>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

<<<<<<< HEAD
const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}: SelectProps) => {
=======
const Select = ({ label, name, options, value, onChange, required = false }: SelectProps) => {

>>>>>>> defd184af27594ee5718df29522dbd40f69b6b8b
  return (
    <div className="select-container">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      >
        <option value="">Selecione uma opção</option>

        {options.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
