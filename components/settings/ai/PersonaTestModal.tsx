import React, { useState, useRef, useEffect } from 'react';
import { AppSettings, AiPersonaName } from '../../../types';
import { getAiResponse } from '../../../services/aiService';
import { Input } from '../../ui/Input';

interface PersonaTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: AiPersonaName;
  settings: AppSettings['ai'];
}

const PersonaTestModal: React.FC<PersonaTestModalProps> = ({ isOpen, onClose, context, settings }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseRef.current) {
        responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setResponse('');
    
    const result = await getAiResponse({ context, userPrompt: prompt, settings });
    
    setResponse(result);
    setIsLoading(false);
    setPrompt('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-800" id="modal-title">
            Test Persona: <span className="text-teal-600 capitalize">{context}</span>
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200">
            <i className="fa-solid fa-times text-slate-600"></i>
          </button>
        </div>
        
        <div ref={responseRef} className="flex-grow my-4 pr-2 overflow-y-auto space-y-4">
            <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-700">
                <p><strong className="font-semibold">System:</strong> You are now chatting with the '{context}' persona. Type a message below to see how it responds based on your current settings.</p>
            </div>
            {response && (
                 <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-900">
                    <pre className="whitespace-pre-wrap font-sans">{response}</pre>
                </div>
            )}
            {isLoading && (
                <div className="flex items-center gap-2 text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Persona is thinking...</span>
                </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="mt-auto border-t border-slate-200 pt-4">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your message here..."
              className="flex-grow"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonaTestModal;