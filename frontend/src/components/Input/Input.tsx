import type { ChangeEvent } from "react";
import "./Input.css";

interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  placeholder?: string;
}

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  placeholder,
}: InputProps) => {
  return (
    <div className="input-container">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
