
import React, { useState, useCallback } from 'react';

interface TextareaWithCounterProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  wordLimit: number;
}

export const TextareaWithCounter: React.FC<TextareaWithCounterProps> = ({ wordLimit, onChange, value, ...props }) => {
  const countWords = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const [wordCount, setWordCount] = useState(countWords(value as string || ''));

  const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWordCount(countWords(e.target.value));
    if (onChange) {
      onChange(e);
    }
  }, [onChange]);

  return (
    <div>
      <textarea
        {...props}
        value={value}
        onChange={handleOnChange}
        className={`block w-full px-3 py-2 bg-white border border-slate-400 rounded-md shadow-sm placeholder-slate-400 
                   focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent 
                   sm:text-sm transition-shadow duration-150 ${props.className}`}
      />
      <div className="text-right text-xs text-slate-500 mt-1" aria-live="polite">
        {wordLimit - wordCount} words left
      </div>
    </div>
  );
};
