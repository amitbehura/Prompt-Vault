import React, { useRef, useState } from 'react';
import { Icons } from './Icons';
import { VaultData } from '../types';

interface Props {
  isOpen: boolean;
  data: VaultData;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onUpdateCategories: (newCats: string[], newFolders: VaultData['folders']) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  importing: boolean;
  searchQuery: string;
}

export const Sidebar: React.FC<Props> = ({
  isOpen, data, selectedCategory, onSelectCategory, onUpdateCategories,
  onExport, onImport, importing, searchQuery
}) => {
  const [editMode, setEditMode] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [renamingCat, setRenamingCat] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newCatName && !data.categories.includes(newCatName)) {
      onUpdateCategories([...data.categories, newCatName], data.folders);
    }
    setNewCatName("");
    setIsAdding(false);
  };

  const handleRename = (oldName: string) => {
    if (tempName && !data.categories.includes(tempName)) {
      const updatedCats = data.categories.map(c => c === oldName ? tempName : c);
      const updatedFolders = data.folders.map(f => f.category === oldName ? { ...f, category: tempName } : f);
      onUpdateCategories(updatedCats, updatedFolders);
      if (selectedCategory === oldName) onSelectCategory(tempName);
    }
    setRenamingCat(null);
  };

  const handleDelete = (cat: string) => {
    // In a real app, we'd invoke the confirm modal here via prop callback, 
    // but for simplicity we'll assume the parent handles data consistency or we just filter.
    // However, to keep it safe, let's just trigger update. The App level should ideally handle confirmation.
    // For this strict structure, we'll assume direct deletion logic is passed or we filter:
    const newCats = data.categories.filter(c => c !== cat);
    const newFolders = data.folders.filter(f => f.category !== cat);
    onUpdateCategories(newCats, newFolders);
    if (selectedCategory === cat) onSelectCategory(null);
  };

  return (
    <div className={`${isOpen ? 'w-72 border-r-2' : 'w-0 border-r-0'} bg-gray-50 border-black transition-all duration-300 flex flex-col relative overflow-hidden shrink-0`}>
      <div className="p-6 border-b-2 border-black bg-white flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">The Vault</h1>
            <p className="text-[10px] font-mono text-gray-500">v.1.4 // SYSTEM</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {data.categories.map(cat => (
          <div key={cat} className="relative group">
            {renamingCat === cat ? (
              <div className="flex items-center gap-1 border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                <input 
                  autoFocus 
                  value={tempName} 
                  onChange={e => setTempName(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleRename(cat)} 
                  className="w-full text-sm font-bold uppercase outline-none px-1"
                />
                <button onClick={() => handleRename(cat)} className="hover:bg-green-100 p-1">
                    <Icons.Check size={14}/>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onSelectCategory(cat)} 
                className={`w-full text-left px-4 py-3 text-sm font-bold uppercase border-2 transition-all flex justify-between items-center
                  ${selectedCategory === cat && !searchQuery 
                    ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-x-[-2px] translate-y-[-2px]' 
                    : 'bg-white border-transparent hover:border-black hover:bg-white text-gray-800'
                  }`}
              >
                {cat}
                {selectedCategory === cat && !searchQuery && <Icons.ChevronRight size={14} />}
              </button>
            )}
            
            {editMode && renamingCat !== cat && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 bg-white border-2 border-black p-0.5 shadow-sm z-10">
                <button onClick={(e) => { e.stopPropagation(); setRenamingCat(cat); setTempName(cat); }} className="p-1 hover:bg-gray-100">
                    <Icons.Edit2 size={12}/>
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(cat); }} className="text-red-500 p-1 hover:bg-red-50">
                    <Icons.Trash2 size={12}/>
                </button>
              </div>
            )}
          </div>
        ))}

        {editMode && (
          isAdding ? (
            <div className="mt-2 flex border-2 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
              <input 
                autoFocus 
                value={newCatName} 
                onChange={e => setNewCatName(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAdd()} 
                className="w-full text-sm font-bold uppercase outline-none px-2 py-1" 
                placeholder="NEW CATEGORY"
              />
              <button onClick={handleAdd} className="p-1 hover:bg-gray-100"><Icons.Check size={14}/></button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)} 
              className="w-full py-3 text-xs font-bold border-2 border-dashed border-gray-300 hover:border-black mt-2 uppercase text-gray-400 hover:text-black transition-colors"
            >
              + Add Category
            </button>
          )
        )}
      </div>

      <div className="p-4 border-t-2 border-black bg-gray-100 space-y-3">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-500">
            <span>Configuration</span>
            <button onClick={() => setEditMode(!editMode)} className="text-black flex items-center gap-1 hover:underline">
                <Icons.Settings size={12} /> {editMode ? 'Done' : 'Edit'}
            </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onExport} 
            className="flex justify-center items-center gap-2 p-2 bg-white border-2 border-black text-xs font-bold hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
          >
            <Icons.Download size={14}/> BACKUP
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={importing} 
            className="flex justify-center items-center gap-2 p-2 bg-white border-2 border-black text-xs font-bold hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none disabled:opacity-50"
          >
            {importing ? 'LOADING...' : <><Icons.Upload size={14}/> RESTORE</>}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".zip" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}/>
        </div>
      </div>
    </div>
  );
};