import { VaultData } from '../types';

declare global {
  interface Window {
    JSZip: any;
  }
}

const loadJSZip = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.JSZip) { 
      resolve(window.JSZip); 
      return; 
    }
    // Simple check loop if script is still loading
    const interval = setInterval(() => {
        if (window.JSZip) {
            clearInterval(interval);
            resolve(window.JSZip);
        }
    }, 100);
    
    // Timeout
    setTimeout(() => {
        clearInterval(interval);
        if(!window.JSZip) reject(new Error("JSZip library not found. Please check internet connection."));
    }, 5000);
  });
};

export const exportToZip = async (data: VaultData): Promise<void> => {
  try {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    
    // Add raw JSON backup
    zip.file("vault_backup.json", JSON.stringify(data, null, 2));
    
    // Create friendly folder structure for 'green' prompts
    const exportFolder = zip.folder("Green_Prompts");
    
    data.folders.forEach((folder) => {
      const greenVersions = data.versions.filter(v => v.folderId === folder.id && v.status === 'green');
      
      if (greenVersions.length > 0) {
        let fileContent = "";
        greenVersions.forEach(v => {
          fileContent += `--- ${v.name} ---\n\n${v.content}\n\n========================================\n\n`;
        });
        
        const safeFolderName = folder.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeCategory = folder.category.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        exportFolder.file(`${safeCategory}_${safeFolderName}.txt`, fileContent);
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `Vault_Backup_${new Date().toISOString().slice(0,10)}.zip`; 
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (e) {
    console.error("Export failed", e);
    throw e;
  }
};

export const importFromZip = async (file: File): Promise<VaultData> => {
  try {
    const JSZip = await loadJSZip();
    const zip = await JSZip.loadAsync(file);
    const jsonFile = zip.file("vault_backup.json");
    
    if (!jsonFile) {
      throw new Error("Invalid backup file: vault_backup.json missing");
    }
    
    const jsonContent = await jsonFile.async("string");
    const parsed = JSON.parse(jsonContent);
    
    if (!parsed.categories || !parsed.folders || !parsed.versions) {
      throw new Error("Invalid backup format");
    }
    
    return parsed as VaultData;
  } catch (e) {
    console.error("Import failed", e);
    throw e;
  }
};