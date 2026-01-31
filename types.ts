export type VersionStatus = 'green' | 'amber' | 'red';

export interface Version {
  id: string;
  folderId: string;
  name: string;
  content: string;
  status: VersionStatus;
  timestamp: number;
}

export interface Folder {
  id: string;
  name: string;
  category: string;
  createdAt: number;
}

export interface VaultData {
  categories: string[];
  folders: Folder[];
  versions: Version[];
}

export type SortMode = 'timestamp' | 'name';

export interface ToastState {
  msg: string;
  type: 'info' | 'success' | 'error';
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
}