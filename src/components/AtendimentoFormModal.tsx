import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import AtendimentoForm from './AtendimentoForm';

interface AtendimentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AtendimentoFormModal: React.FC<AtendimentoFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleFormSuccess = () => {
    setNotificationType('success');
    setNotificationMessage('✓ Atendimento criado com sucesso!');
    setShowNotification(true);

    setTimeout(() => {
      setShowNotification(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Nova Venda / Atendimento</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className={`sticky top-16 p-4 flex items-center gap-3 ${
            notificationType === 'success'
              ? 'bg-green-50 border-b-2 border-green-200'
              : 'bg-red-50 border-b-2 border-red-200'
          }`}>
            {notificationType === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <p className={notificationType === 'success' ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
              {notificationMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="p-6">
          <AtendimentoForm onSuccess={handleFormSuccess} isModal={true} />
        </div>
      </div>
    </div>
  );
};

export default AtendimentoFormModal;
