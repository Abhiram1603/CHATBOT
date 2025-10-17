import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, id, description }) => {
  return (
    <div className="flex justify-between items-center">
        <div>
            <span className="text-[var(--text-primary)] text-sm font-medium">{label}</span>
            {description && <p className="text-xs text-[var(--text-secondary)]">{description}</p>}
        </div>
        <label htmlFor={id} className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--accent-cyan)]' : 'bg-[var(--toggle-bg-inactive)]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-full' : ''}`}></div>
            </div>
        </label>
    </div>
  );
};

export default ToggleSwitch;