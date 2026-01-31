import { VaultData } from './types';

export const INITIAL_DATA: VaultData = {
  categories: ["Sales", "Creative", "Data Analytics", "Engineering"],
  folders: [
    { id: 'f1', name: 'Cold Outreach', category: 'Sales', createdAt: Date.now() },
    { id: 'f2', name: 'Objection Handling', category: 'Sales', createdAt: Date.now() },
    { id: 'f3', name: 'Blog Post Gen', category: 'Creative', createdAt: Date.now() },
  ],
  versions: [
    { 
      id: 'v1', 
      folderId: 'f1', 
      name: 'Initial Draft', 
      content: 'Write a cold email to a prospective client about our new AI tool...', 
      status: 'amber', 
      timestamp: Date.now() - 100000 
    },
    { 
      id: 'v2', 
      folderId: 'f1', 
      name: 'Optimized V2', 
      content: 'Focus on ROI and time-saving features. Be concise. \n\nSubject: Save 20h/week with AI...', 
      status: 'green', 
      timestamp: Date.now() 
    }
  ]
};

export const generateId = () => Math.random().toString(36).substr(2, 9);