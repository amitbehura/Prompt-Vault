import React from 'react';
import { Version, Folder, VersionStatus } from '../types';
import { Icons } from './Icons';

interface Props {
  folder: Folder;
  versions: Version[];
  onBack: () => void;
  onAddVersion: (content?: string) => void;
  onUpdateVersion: (id: string, updates: Partial<Version>) => void;
  onDeleteVersion: (id: string) => void;
}

export const VersionList: React.FC<Props> = ({
  folder, versions, onBack, onAddVersion, onUpdateVersion, onDeleteVersion
}) => {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Detail Header */}
      <div className="px-8 py-5 bg-white border-b-2 border-black flex justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack} 
                className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black rounded-full transition-all"
            >
                <Icons.ArrowLeft size={20}/>
            </button>
            <div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-0.5">{folder.category}</div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{folder.name}</h2>
            </div>
        </div>
        <button 
            onClick={() => onAddVersion()} 
            className="flex gap-2 px-5 py-2.5 border-2 border-black bg-white font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all items-center"
        >
            <Icons.Plus size={16}/> NEW VERSION
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
        {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300">
                <Icons.FileText size={48} className="mb-4 opacity-20"/>
                <p className="font-mono mb-4 text-sm">NO VERSIONS RECORDED</p>
                <button onClick={() => onAddVersion()} className="underline font-bold text-black hover:no-underline">Start writing the first draft</button>
            </div>
        ) : (
            versions.map((v, i) => (
            <div 
                key={v.id} 
                className={`bg-white border-2 border-black p-0 transition-all duration-300 ${i === 0 ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] scale-[1.01]' : 'shadow-sm opacity-90 hover:opacity-100 hover:scale-[1.005]'}`}
            >
                {/* Card Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Status Toggles */}
                        <div className="flex border-2 border-black bg-white p-0.5 rounded-full shadow-sm">
                            {(['green', 'amber', 'red'] as VersionStatus[]).map(status => (
                                <button
                                    key={status}
                                    onClick={() => onUpdateVersion(v.id, { status })}
                                    className={`w-4 h-4 rounded-full m-0.5 border border-black/10 transition-transform hover:scale-110
                                        ${v.status === status 
                                            ? (status === 'green' ? 'bg-green-500' : status === 'amber' ? 'bg-amber-400' : 'bg-red-500') 
                                            : 'bg-gray-200 hover:bg-gray-300'}`}
                                    title={`Mark as ${status}`}
                                />
                            ))}
                        </div>
                        
                        <input 
                            value={v.name} 
                            onChange={e => onUpdateVersion(v.id, { name: e.target.value })} 
                            className="font-bold text-lg bg-transparent border-b border-transparent focus:border-black outline-none w-full max-w-md px-2"
                            placeholder="Version Name"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{new Date(v.timestamp).toLocaleString()}</span>
                        <button onClick={() => onDeleteVersion(v.id)} className="text-gray-300 hover:text-red-600 transition-colors p-1">
                            <Icons.Trash2 size={18}/>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative group">
                    <textarea 
                        value={v.content} 
                        onChange={e => onUpdateVersion(v.id, { content: e.target.value })} 
                        className="w-full min-h-[160px] p-6 bg-white outline-none resize-y font-mono text-sm leading-relaxed text-gray-800" 
                        placeholder="Enter your prompt or content here..."
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center p-3 border-t-2 border-black bg-white">
                    <div className={`px-2 py-0.5 text-[10px] font-bold uppercase border border-black rounded-sm
                        ${v.status === 'green' ? 'bg-green-100 text-green-800' : v.status === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                    `}>
                        {v.status}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={() => onAddVersion(v.content)} 
                            className="px-4 py-1.5 text-xs font-bold border-2 border-transparent hover:border-black uppercase transition-all"
                        >
                            Fork Draft
                        </button>
                        <button 
                            onClick={() => copyToClipboard(v.content)} 
                            className="flex gap-2 items-center px-5 py-1.5 bg-black text-white text-xs font-bold border-2 border-black hover:bg-white hover:text-black uppercase transition-all"
                        >
                            <Icons.Copy size={14}/> Copy
                        </button>
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};