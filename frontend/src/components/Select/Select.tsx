import type { ChangeEvent } from "react";
import "./Select.css";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps {
  label: string;
  name: string;
  options: readonly (string | OpcaoSelect)[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
}: SelectProps) => {
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
        {options.map((opcao) => {
          const valor = typeof opcao === "string" ? opcao : opcao.valor;
          const rotulo = typeof opcao === "string" ? opcao : opcao.rotulo;
          return (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
