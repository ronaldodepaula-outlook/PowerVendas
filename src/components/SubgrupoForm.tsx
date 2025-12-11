import React, { useEffect, useState } from 'react';
import { type Subgrupo } from '../services/subgrupos.service';

interface Props {
  subgrupo?: Subgrupo | null;
  onSubmit: (data: Partial<Subgrupo>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const SubgrupoForm: React.FC<Props> = ({ subgrupo, onSubmit, onCancel, isLoading = false }) => {
  const [form, setForm] = useState<Partial<Subgrupo>>({
    nome: subgrupo?.nome || '',
    descricao: subgrupo?.descricao || '',
    ativo: subgrupo?.ativo ?? 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (subgrupo) setForm({ nome: subgrupo.nome, descricao: subgrupo.descricao || '', ativo: subgrupo.ativo ?? 1 });
  }, [subgrupo]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome || form.nome.trim().length < 2) e.nome = 'Nome é obrigatório (mín. 2 caracteres)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nome *</label>
        <input name="nome" value={form.nome || ''} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className="w-full px-3 py-2 border rounded" />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
        <input name="descricao" value={form.descricao || ''} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.ativo} onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked ? 1 : 0 }))} />
          <span className="text-sm text-gray-700">Ativo</span>
        </label>
      </div>

      <div className="flex gap-2 pt-4">
        <button type="submit" disabled={submitting || isLoading} className="flex-1 bg-blue-600 text-white py-2 rounded">{submitting ? 'Salvando...' : subgrupo ? 'Atualizar' : 'Criar'}</button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 text-black py-2 rounded">Cancelar</button>
      </div>
    </form>
  );
};

export default SubgrupoForm;
