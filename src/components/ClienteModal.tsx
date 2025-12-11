import React from 'react';
import { type Cliente } from '../services/clientes.service';
import ClienteForm from './ClienteForm';

interface ClienteModalProps {
  isOpen: boolean;
  cliente?: Cliente | null;
  onClose: () => void;
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
  isLoading?: boolean;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({
  isOpen,
  cliente,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {cliente ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        <ClienteForm
          cliente={cliente}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ClienteModal;
