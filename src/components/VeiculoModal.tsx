import React from 'react';
import VeiculoForm from './VeiculoForm';
import { type Veiculo } from '../services/veiculos.service';

interface Props {
  isOpen: boolean;
  veiculo: Veiculo | null;
  onClose: () => void;
  onSubmit: (data: Partial<Veiculo>) => Promise<void>;
  isLoading?: boolean;
}

const VeiculoModal: React.FC<Props> = ({ isOpen, veiculo, onClose, onSubmit, isLoading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{veiculo ? 'Editar Veículo' : 'Novo Veículo'}</h2>
          <VeiculoForm veiculo={veiculo} onSubmit={onSubmit} onCancel={onClose} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default VeiculoModal;
