
import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  instructions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, required, instructions, children, className = 'mb-6' }) => {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-800">
        {required && <span className="text-red-500 font-bold">* </span>}
        {label}
      </label>
      {instructions && <div className="mt-1 text-xs text-slate-500 prose-sm max-w-none">{instructions}</div>}
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
};

export default FormField;
