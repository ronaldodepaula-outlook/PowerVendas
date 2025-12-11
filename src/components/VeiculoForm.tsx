import React, { useState, useEffect } from 'react';
import { type Veiculo } from '../services/veiculos.service';

interface VeiculoFormProps {
  veiculo?: Veiculo | null;
  onSubmit: (data: Partial<Veiculo>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const currentYear = new Date().getFullYear();

const VeiculoForm: React.FC<VeiculoFormProps> = ({ veiculo, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState<Partial<Veiculo>>({
    id_cliente: veiculo?.id_cliente || undefined,
    placa: veiculo?.placa || '',
    modelo: veiculo?.modelo || '',
    marca: veiculo?.marca || '',
    ano: veiculo?.ano || undefined,
    cor: veiculo?.cor || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (veiculo) setFormData(veiculo);
  }, [veiculo]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.placa || formData.placa.trim().length < 4) e.placa = 'Placa é obrigatória (mín. 4 caracteres)';
    if (!formData.modelo || formData.modelo.trim().length < 3) e.modelo = 'Modelo é obrigatório';
    if (formData.ano !== undefined && formData.ano !== null) {
      if (!Number.isInteger(formData.ano) || formData.ano < 1900 || formData.ano > currentYear + 1) e.ano = 'Ano inválido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: name === 'ano' ? (value === '' ? undefined : parseInt(value, 10)) : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Placa *</label>
        <input name="placa" value={formData.placa || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        {errors.placa && <p className="text-red-500 text-sm mt-1">{errors.placa}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo *</label>
        <input name="modelo" value={formData.modelo || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        {errors.modelo && <p className="text-red-500 text-sm mt-1">{errors.modelo}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Marca</label>
        <input name="marca" value={formData.marca || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Ano</label>
        <input name="ano" type="number" value={formData.ano ?? ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
        {errors.ano && <p className="text-red-500 text-sm mt-1">{errors.ano}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Cor</label>
        <input name="cor" value={formData.cor || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="flex gap-2 pt-4">
        <button type="submit" disabled={isSubmitting || isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded">{isSubmitting ? 'Salvando...' : veiculo ? 'Atualizar' : 'Criar'}</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 text-black py-2 rounded">Cancelar</button>
      </div>
    </form>
  );
};

export default VeiculoForm;
