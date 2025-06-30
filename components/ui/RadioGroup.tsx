
import React from 'react';

interface RadioGroupProps {
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, selectedValue, onChange, name }) => {
  return (
    <div className="space-y-2">
      {options.map(option => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500"
          />
          <label htmlFor={`${name}-${option.value}`} className="ml-3 block text-sm font-medium text-slate-700">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};
