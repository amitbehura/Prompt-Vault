import React from 'react';
import { Icons } from './Icons';
import { ConfirmModalState } from '../types';

interface Props {
  modal: ConfirmModalState;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<Props> = ({ modal, onCancel }) => {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm p-6 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <Icons.AlertTriangle size={24} /> 
          <h3 className="text-xl font-black uppercase tracking-tight">{modal.title}</h3>
        </div>
        <p className="mb-6 font-mono text-sm text-gray-700 leading-relaxed">{modal.message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 font-bold hover:bg-gray-100 border-2 border-transparent transition-colors"
          >
            CANCEL
          </button>
          <button 
            onClick={modal.onConfirm!} 
            className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-black hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};