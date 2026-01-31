import React from 'react';
import { Icons } from './Icons';
import { SortMode } from '../types';

interface Props {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSort: boolean;
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
}

export const Header: React.FC<Props> = ({ 
  isSidebarOpen, toggleSidebar, searchQuery, setSearchQuery, 
  showSort, sortMode, setSortMode 
}) => {
  return (
    <header className="h-16 border-b-2 border-black flex items-center px-4 justify-between bg-white shrink-0 z-20 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
            onClick={toggleSidebar} 
            className="p-2 border-2 border-transparent hover:border-black transition-all hover:bg-gray-50 active:bg-black active:text-white"
        >
            {isSidebarOpen ? <Icons.ArrowLeft size={20}/> : <Icons.Menu size={20}/>}
        </button>
        
        <div className="relative flex-1 max-w-xl group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Icons.Search size={18} />
            </div>
            <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="SEARCH ARCHIVE..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-200 focus:border-black outline-none font-mono text-sm transition-all"
            />
        </div>
      </div>

      {showSort && (
        <div className="flex gap-2 ml-4 bg-gray-100 p-1 border-2 border-transparent">
          <button 
            onClick={() => setSortMode('timestamp')} 
            className={`p-1.5 border-2 transition-all ${sortMode === 'timestamp' ? 'bg-white border-black shadow-sm' : 'border-transparent text-gray-400 hover:text-black'}`}
            title="Sort by Date"
          >
            <Icons.Clock size={16}/>
          </button>
          <button 
            onClick={() => setSortMode('name')} 
            className={`p-1.5 border-2 transition-all ${sortMode === 'name' ? 'bg-white border-black shadow-sm' : 'border-transparent text-gray-400 hover:text-black'}`}
            title="Sort by Name"
          >
            <Icons.FileText size={16}/>
          </button>
        </div>
      )}
    </header>
  );
};