import React from "react";
import "./Select.css";

export interface OpcaoSelect {
  valor: string;
  rotulo: string;
}

interface SelectProps {
  label: string;
  name: string;
  options: OpcaoSelect[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

const Select = ({ label, name, options, value, onChange, required = false }: SelectProps) => {

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
