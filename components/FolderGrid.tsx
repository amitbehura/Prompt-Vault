import React, { useState } from 'react';
import { Folder, Version } from '../types';
import { Icons } from './Icons';

interface Props {
  folders: Folder[];
  versions: Version[];
  category: string | null;
  searchQuery: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDuplicateFolder: (folder: Folder) => void;
}

export const FolderGrid: React.FC<Props> = ({
  folders, versions, category, searchQuery,
  onSelectFolder, onCreateFolder, onRenameFolder, onDeleteFolder, onDuplicateFolder
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateFolder(newName);
      setNewName("");
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (tempName.trim()) {
      onRenameFolder(id, tempName);
    }
    setRenamingId(null);
  };

  const getFolderStatus = (folderId: string) => {
    const folderVersions = versions.filter(v => v.folderId === folderId);
    if (folderVersions.some(v => v.status === 'green')) return 'green';
    if (folderVersions.some(v => v.status === 'amber')) return 'amber';
    return 'gray';
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-dots-pattern relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-end mb-8 pb-4 border-b-2 border-black/10">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tight">
                    {searchQuery ? `Search: "${searchQuery}"` : (category || "Select Category")}
                    </h2>
                    {!searchQuery && category && <p className="font-mono text-gray-500 mt-1 text-sm">{folders.length} FOLDERS</p>}
                </div>
                
                {category && !searchQuery && (
                <button 
                    onClick={() => setIsCreating(true)} 
                    className="flex gap-2 bg-black text-white px-6 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(100,100,100,1)] border-2 border-black transition-all"
                >
                    <Icons.Plus size={20}/> NEW FOLDER
                </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isCreating && (
                <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">New Folder Name</h3>
                    <input 
                    autoFocus 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleCreate()} 
                    className="w-full font-bold border-b-2 border-gray-200 focus:border-black outline-none uppercase mb-4 py-1 text-lg" 
                    placeholder="UNTITLED"
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-sm"><Icons.X size={16}/></button>
                        <button onClick={handleCreate} className="p-2 bg-black text-white hover:opacity-80 rounded-sm"><Icons.Check size={16}/></button>
                    </div>
                </div>
                )}

                {folders.map(f => {
                    const status = getFolderStatus(f.id);
                    const versionCount = versions.filter(v => v.folderId === f.id).length;
                    
                    return (
                        <div 
                            key={f.id} 
                            onClick={() => onSelectFolder(f.id)} 
                            className="group cursor-pointer bg-white border-2 border-black p-4 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col h-32 justify-between transition-all duration-200 hover:-translate-y-1"
                        >
                        {renamingId === f.id ? (
                            <div onClick={e => e.stopPropagation()} className="h-full flex flex-col justify-center">
                                <input 
                                    autoFocus 
                                    value={tempName} 
                                    onChange={e => setTempName(e.target.value)} 
                                    onKeyDown={e => e.key === 'Enter' && handleRename(f.id)} 
                                    className="w-full text-base font-bold border-b-2 border-black outline-none uppercase pb-1"
                                />
                                <div className="flex justify-end mt-2 text-xs font-bold gap-2">
                                    <button onClick={() => setRenamingId(null)} className="hover:underline">CANCEL</button>
                                    <button onClick={() => handleRename(f.id)} className="bg-black text-white px-2 py-0.5">SAVE</button>
                                </div>
                            </div>
                        ) : (
                            <>
                            <div className="flex justify-between items-start">
                                <Icons.Folder size={24} className="text-gray-300 group-hover:text-black transition-colors"/>
                                <div className={`w-2.5 h-2.5 rounded-full border border-black ${status === 'green' ? 'bg-green-500' : status === 'amber' ? 'bg-amber-400' : 'bg-transparent'}`}/>
                            </div>
                            
                            <div>
                                <h3 className="text-base font-black uppercase truncate tracking-tight">{f.name}</h3>
                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{versionCount} VERSION{versionCount !== 1 ? 'S' : ''}</p>
                            </div>

                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 bg-white border-2 border-black p-0.5 shadow-sm transition-opacity" onClick={e => e.stopPropagation()}>
                                <button onClick={() => { setRenamingId(f.id); setTempName(f.name); }} className="p-1 hover:bg-gray-100" title="Rename"><Icons.Edit2 size={12}/></button>
                                <button onClick={() => onDuplicateFolder(f)} className="p-1 hover:bg-gray-100" title="Duplicate"><Icons.Copy size={12}/></button>
                                <button onClick={() => onDeleteFolder(f.id)} className="p-1 text-red-500 hover:bg-red-50" title="Delete"><Icons.Trash2 size={12}/></button>
                            </div>
                            </>
                        )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};