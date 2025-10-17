import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  id: string;
  label: string;
  as?: 'input' | 'textarea';
}

const InputField: React.FC<InputFieldProps> = ({ id, label, type = 'text', as = 'input', className, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';
  const currentType = isPasswordField ? (isPasswordVisible ? 'text' : 'password') : type;

  const InputComponent = as;
  const commonProps = {
    id,
    name: id,
    placeholder: " ", // Required for floating label effect
    className: `block w-full px-3 py-2.5 text-sm text-[var(--text-primary)] bg-transparent border border-[var(--border-primary)] rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] peer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isPasswordField ? 'pr-10' : ''} ${className}`,
    ...props,
  };

  return (
    <div className="relative">
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input type={currentType} {...commonProps} />
      )}
      <label
        htmlFor={id}
        className="absolute text-sm text-[var(--text-secondary)] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[var(--bg-secondary)] px-2 peer-focus:px-2 peer-focus:text-[var(--accent-cyan)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 transition-all"
      >
        {label}
      </label>
      {isPasswordField && (
        <button
          type="button"
          onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        >
          {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
};

export default InputField;
