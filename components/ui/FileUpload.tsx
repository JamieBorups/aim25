
import React, { useRef } from 'react';

interface FileUploadProps {
  id: string;
  files: File[];
  onFileChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ id, files, onFileChange, multiple = true, accept }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (multiple) {
        onFileChange([...files, ...newFiles]);
      } else {
        onFileChange(newFiles);
      }
    }
  };

  const removeFile = (fileName: string) => {
    onFileChange(files.filter(file => file.name !== fileName));
  };

  return (
    <div>
      <div 
        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-teal-400"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-1 text-center">
          <i className="fa fa-upload mx-auto h-12 w-12 text-slate-400"></i>
          <div className="flex text-sm text-slate-600">
            <span className="relative rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500">
              Upload files
            </span>
            <input ref={fileInputRef} id={id} name={id} type="file" className="sr-only" multiple={multiple} accept={accept} onChange={handleFileChange} />
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-slate-500">{accept ? accept.replace(/,/g, ', ') : 'Any file type'}</p>
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-slate-700">Selected files:</h4>
          <ul className="mt-2 border border-slate-200 rounded-md divide-y divide-slate-200">
            {files.map(file => (
              <li key={file.name} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                   <i className="fa fa-paperclip h-5 w-5 text-slate-400" aria-hidden="true"></i>
                  <span className="ml-2 flex-1 w-0 truncate">{file.name}</span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button onClick={() => removeFile(file.name)} className="font-medium text-red-600 hover:text-red-500">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
