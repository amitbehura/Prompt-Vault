import React, { useState, useEffect, useMemo } from 'react';
import { VaultData, ToastState, SortMode, ConfirmModalState, Folder, Version } from './types';
import { INITIAL_DATA, generateId } from './constants';
import { exportToZip, importFromZip } from './services/zipService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FolderGrid } from './components/FolderGrid';
import { VersionList } from './components/VersionList';
import { ConfirmModal } from './components/ConfirmModal';

const App: React.FC = () => {
  // --- STATE ---
  const [data, setData] = useState<VaultData>(() => {
    try {
      const stored = localStorage.getItem('the_vault_data');
      return stored ? JSON.parse(stored) : INITIAL_DATA;
    } catch {
      return INITIAL_DATA;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('timestamp');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [importing, setImporting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({ 
    isOpen: false, title: "", message: "", onConfirm: null 
  });

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('the_vault_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // --- COMPUTED ---
  const filteredFolders = useMemo(() => {
    if (!selectedCategory && !searchQuery) return [];
    let f = data.folders;
    if (selectedCategory) f = f.filter(x => x.category === selectedCategory);
    if (searchQuery) f = data.folders.filter(x => x.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return f;
  }, [data.folders, selectedCategory, searchQuery]);

  const activeVersions = useMemo(() => {
    if (!selectedFolderId) return [];
    return data.versions
      .filter(v => v.folderId === selectedFolderId)
      .sort((a, b) => sortMode === 'timestamp' 
        ? b.timestamp - a.timestamp 
        : a.name.localeCompare(b.name));
  }, [data.versions, selectedFolderId, sortMode]);

  const activeFolder = data.folders.find(f => f.id === selectedFolderId);

  // --- ACTIONS ---
  const showToast = (msg: string, type: ToastState['type'] = 'info') => setToast({ msg, type });

  const requestConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleUpdateCategories = (newCats: string[], newFolders: Folder[]) => {
    setData(prev => ({ ...prev, categories: newCats, folders: newFolders }));
  };

  const handleExport = async () => {
    showToast("Preparing Zip...", 'info');
    try {
      await exportToZip(data);
      showToast("Export Successful", 'success');
    } catch (e) {
      showToast("Export Failed", 'error');
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const newData = await importFromZip(file);
      setData(newData);
      showToast("Vault Restored", 'success');
    } catch (e) {
      showToast("Import Failed", 'error');
    } finally {
      setImporting(false);
    }
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      category: selectedCategory!,
      createdAt: Date.now()
    };
    setData(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
    showToast("Folder Created", 'success');
  };

  const renameFolder = (id: string, name: string) => {
    setData(prev => ({
      ...prev,
      folders: prev.folders.map(f => f.id === id ? { ...f, name } : f)
    }));
  };

  const deleteFolder = (id: string) => {
    requestConfirm("Delete Folder?", "All versions within this folder will be permanently lost.", () => {
      setData(prev => ({
        ...prev,
        folders: prev.folders.filter(f => f.id !== id),
        versions: prev.versions.filter(v => v.folderId !== id)
      }));
      showToast("Folder Deleted", 'info');
    });
  };

  const duplicateFolder = (folder: Folder) => {
    const newId = generateId();
    const newFolder = { ...folder, id: newId, name: `${folder.name} (Copy)` };
    const newVersions = data.versions
      .filter(v => v.folderId === folder.id)
      .map(v => ({ ...v, id: generateId(), folderId: newId }));

    setData(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
      versions: [...prev.versions, ...newVersions]
    }));
    showToast("Folder Duplicated", 'success');
  };

  const addVersion = (content: string = "") => {
    if (!selectedFolderId) return;
    const newVer: Version = {
      id: generateId(),
      folderId: selectedFolderId,
      name: `Version ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
      content,
      status: 'amber',
      timestamp: Date.now()
    };
    setData(prev => ({ ...prev, versions: [newVer, ...prev.versions] }));
  };

  const updateVersion = (id: string, updates: Partial<Version>) => {
    setData(prev => ({
      ...prev,
      versions: prev.versions.map(v => v.id === id ? { ...v, ...updates, timestamp: Date.now() } : v)
    }));
  };

  const deleteVersion = (id: string) => {
    requestConfirm("Delete Draft?", "This specific version will be removed.", () => {
      setData(prev => ({ ...prev, versions: prev.versions.filter(v => v.id !== id) }));
      showToast("Draft Deleted", 'info');
    });
  };

  return (
    <div className="flex h-screen w-full bg-white text-black font-sans overflow-hidden relative">
      {/* GLOBAL TOAST */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-down">
            <div className={`px-6 py-3 border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${toast.type === 'error' ? 'text-red-600' : 'text-black'}`}>
                <div className={`w-3 h-3 rounded-full ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}/>
                <span className="font-bold font-mono text-sm uppercase">{toast.msg}</span>
            </div>
        </div>
      )}

      {/* MODALS */}
      <ConfirmModal modal={confirmModal} onCancel={() => setConfirmModal(p => ({ ...p, isOpen: false }))} />

      {/* LAYOUT */}
      <Sidebar 
        isOpen={isSidebarOpen}
        data={data}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedFolderId(null); setSearchQuery(""); }}
        onUpdateCategories={handleUpdateCategories}
        onExport={handleExport}
        onImport={handleImport}
        importing={importing}
        searchQuery={searchQuery}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <Header 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          setSearchQuery={(q) => { setSearchQuery(q); if(q) { setSelectedFolderId(null); setSelectedCategory(null); } }}
          showSort={!!selectedFolderId}
          sortMode={sortMode}
          setSortMode={setSortMode}
        />

        <main className="flex-1 overflow-hidden relative">
          {!selectedFolderId ? (
            <FolderGrid 
              folders={filteredFolders}
              versions={data.versions}
              category={selectedCategory}
              searchQuery={searchQuery}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={createFolder}
              onRenameFolder={renameFolder}
              onDeleteFolder={deleteFolder}
              onDuplicateFolder={duplicateFolder}
            />
          ) : activeFolder ? (
            <VersionList 
              folder={activeFolder}
              versions={activeVersions}
              onBack={() => setSelectedFolderId(null)}
              onAddVersion={addVersion}
              onUpdateVersion={updateVersion}
              onDeleteVersion={deleteVersion}
            />
          ) : (
            <div className="p-8 text-center text-red-500 font-bold">Error: Folder not found</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;