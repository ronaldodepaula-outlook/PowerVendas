import React from 'react';
import BateriaForm from './BateriaForm';
import { type Bateria } from '../services/baterias.service';

interface BateriaModalProps {
  isOpen: boolean;
  bateria: Bateria | null;
  onClose: () => void;
  onSubmit: (data: Partial<Bateria>) => Promise<void>;
  isLoading?: boolean;
}

const BateriaModal: React.FC<BateriaModalProps> = ({
  isOpen,
  bateria,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {bateria ? 'Editar Bateria' : 'Nova Bateria'}
          </h2>
          <BateriaForm
            bateria={bateria}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default BateriaModal;
