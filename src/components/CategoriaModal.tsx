import React from 'react';
import CategoriaForm from './CategoriaForm';
import { type Categoria } from '../services/categorias.service';

interface Props {
  isOpen: boolean;
  categoria: Categoria | null;
  onClose: () => void;
  onSubmit: (data: Partial<Categoria>) => Promise<void>;
  isLoading?: boolean;
}

const CategoriaModal: React.FC<Props> = ({ isOpen, categoria, onClose, onSubmit, isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{categoria ? 'Editar Categoria' : 'Nova Categoria'}</h2>
          <CategoriaForm categoria={categoria} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default CategoriaModal;
