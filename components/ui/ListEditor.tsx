import React from 'react';
import { produce } from 'https://esm.sh/immer';
import { Input } from './Input';
import { CustomStatus } from '../../types';

interface ListEditorProps {
    items: CustomStatus[];
    onChange: (newItems: CustomStatus[]) => void;
    itemLabel: string;
    withColor?: boolean;
}

const newId = () => `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const DEFAULT_COLOR_CLASSES = "bg-slate-100 text-slate-800";

const ListEditor: React.FC<ListEditorProps> = ({ items, onChange, itemLabel, withColor = false }) => {

    const handleAddItem = () => {
        const newItem: CustomStatus = {
            id: newId(),
            label: `New ${itemLabel}`,
            color: DEFAULT_COLOR_CLASSES
        };
        onChange([...items, newItem]);
    };

    const handleUpdateItem = (id: string, field: 'label' | 'color', value: string) => {
        const newItems = produce(items, draft => {
            const item = draft.find(i => i.id === id);
            if (item) {
                (item as any)[field] = value;
            }
        });
        onChange(newItems);
    };

    const handleRemoveItem = (id: string) => {
        onChange(items.filter(item => item.id !== id));
    };

    const colorOptions = [
      { label: "Green", value: "bg-green-100 text-green-800" },
      { label: "Blue", value: "bg-blue-100 text-blue-800" },
      { label: "Yellow", value: "bg-yellow-100 text-yellow-800" },
      { label: "Rose", value: "bg-rose-100 text-rose-800" },
      { label: "Indigo", value: "bg-indigo-100 text-indigo-800" },
      { label: "Purple", value: "bg-purple-100 text-purple-800" },
      { label: "Slate", value: "bg-slate-100 text-slate-800" },
      { label: "Gray", value: "bg-gray-100 text-gray-800" },
    ];

    return (
        <div className="space-y-3">
            {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className={withColor ? "col-span-6" : "col-span-11"}>
                        <Input
                            aria-label={`${itemLabel} name`}
                            type="text"
                            value={item.label}
                            onChange={e => handleUpdateItem(item.id, 'label', e.target.value)}
                        />
                    </div>
                    {withColor && (
                        <div className="col-span-5">
                             <select
                                value={item.color}
                                onChange={e => handleUpdateItem(item.id, 'color', e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-slate-400 rounded-md shadow-sm 
                                           focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent
                                           sm:text-sm transition-shadow duration-150"
                              >
                                {colorOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="col-span-1 text-right">
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors" aria-label={`Remove ${item.label}`}>
                            <i className="fa-solid fa-trash-alt fa-fw"></i>
                        </button>
                    </div>
                </div>
            ))}

            <div className="pt-2">
                 <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add {itemLabel}
                </button>
            </div>
        </div>
    );
};

export default ListEditor;