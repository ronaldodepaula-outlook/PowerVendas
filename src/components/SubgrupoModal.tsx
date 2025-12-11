import React from 'react';
import SubgrupoForm from './SubgrupoForm';
import { type Subgrupo } from '../services/subgrupos.service';

interface Props {
  isOpen: boolean;
  subgrupo: Subgrupo | null;
  onClose: () => void;
  onSubmit: (data: Partial<Subgrupo>) => Promise<void>;
  isLoading?: boolean;
}

const SubgrupoModal: React.FC<Props> = ({ isOpen, subgrupo, onClose, onSubmit, isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{subgrupo ? 'Editar Subgrupo' : 'Novo Subgrupo'}</h2>
          <SubgrupoForm subgrupo={subgrupo} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default SubgrupoModal;
