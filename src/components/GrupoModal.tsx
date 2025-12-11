import React from 'react';
import GrupoForm from './GrupoForm';
import { type Grupo } from '../services/grupos.service';

interface Props {
  isOpen: boolean;
  grupo: Grupo | null;
  onClose: () => void;
  onSubmit: (data: Partial<Grupo>) => Promise<void>;
  isLoading?: boolean;
}

const GrupoModal: React.FC<Props> = ({ isOpen, grupo, onClose, onSubmit, isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{grupo ? 'Editar Grupo' : 'Novo Grupo'}</h2>
          <GrupoForm grupo={grupo} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default GrupoModal;
