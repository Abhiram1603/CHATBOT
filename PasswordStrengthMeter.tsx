import React from 'react';
import { PasswordStrength } from '../../utils/passwordUtils';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ strength }) => {
  if (!strength.text) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }}
        ></div>
      </div>
      <span className="text-xs font-medium" style={{ color: strength.color }}>
        {strength.text}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
