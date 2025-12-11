import React, { useState, useEffect } from 'react';
import { type Cliente } from '../services/clientes.service';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  cliente,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    }
  }, [cliente]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefone && !/^\d{10,}$/.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone deve conter no mínimo 10 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nome *
        </label>
        <input
          type="text"
          name="nome"
          value={formData.nome || ''}
          onChange={handleChange}
          placeholder="Nome completo do cliente"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.nome
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          placeholder="email@exemplo.com"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Telefone
        </label>
        <input
          type="tel"
          name="telefone"
          value={formData.telefone || ''}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
            errors.telefone
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading || isSubmitting}
        />
        {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
      </div>

      {/* Endereço */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Endereço
        </label>
        <input
          type="text"
          name="endereco"
          value={formData.endereco || ''}
          onChange={handleChange}
          placeholder="Rua, número e complemento"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        />
      </div>

      {/* CEP */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          CEP
        </label>
        <input
          type="text"
          name="cep"
          value={formData.cep || ''}
          onChange={handleChange}
          placeholder="00000-000"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || isSubmitting}
        />
      </div>

      {/* Cidade e Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cidade
          </label>
          <input
            type="text"
            name="cidade"
            value={formData.cidade || ''}
            onChange={handleChange}
            placeholder="São Paulo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Estado
          </label>
          <input
            type="text"
            name="estado"
            value={formData.estado || ''}
            onChange={handleChange}
            placeholder="SP"
            maxLength={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isSubmitting}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isSubmitting ? 'Salvando...' : cliente ? 'Atualizar' : 'Criar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 disabled:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ClienteForm;
