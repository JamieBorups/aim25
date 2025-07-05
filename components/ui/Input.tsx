
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  //
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className={`block w-full px-3 py-2 bg-white border border-slate-400 rounded-md shadow-sm placeholder-slate-400 
                 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent 
                 sm:text-sm transition-shadow duration-150
                 disabled:bg-slate-100 disabled:text-slate-500 disabled:border-slate-300 ${props.className || ''}`}
    />
  );
});

Input.displayName = 'Input';
