
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ options, ...props }) => {
  return (
    <select
      {...props}
      className={`block w-full pl-3 pr-10 py-2 text-base border-slate-400 rounded-md shadow-sm 
                 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent
                 sm:text-sm transition-shadow duration-150 ${props.className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
