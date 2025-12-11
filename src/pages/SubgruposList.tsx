import React, { useEffect, useState } from 'react';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  listSubgruposByGrupo,
  createSubgrupo,
  updateSubgrupo,
  deleteSubgrupo,
  type Subgrupo,
} from '../services/subgrupos.service';
import SubgrupoModal from '../components/SubgrupoModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ConfirmDelete {
  isOpen: boolean;
  subgrupo: Subgrupo | null;
}

const SubgruposList: React.FC = () => {
  const { id: categoryId, grupoId } = useParams<{ id: string; grupoId: string }>();
  const categoryIdNum = Number(categoryId);
  const grupoIdNum = Number(grupoId);
  const navigate = useNavigate();

  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubgrupo, setEditingSubgrupo] = useState<Subgrupo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>({ isOpen: false, subgrupo: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = async () => {
    if (!grupoIdNum) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listSubgruposByGrupo(grupoIdNum);
      setSubgrupos(data);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao carregar subgrupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [grupoId]);

  const handleNew = () => {
    setEditingSubgrupo(null);
    setModalOpen(true);
  };

  const handleEdit = (s: Subgrupo) => {
    setEditingSubgrupo(s);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingSubgrupo(null);
  };

  const handleSave = async (data: Partial<Subgrupo>) => {
    setError(null);
    try {
      if (!categoryIdNum || !grupoIdNum) throw new Error('Contexto inválido');
      if (editingSubgrupo) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id_subgrupo, id_categoria, id_grupo, id_empresa, created_at, updated_at, ...payload } = data as Partial<Subgrupo>;
        const updated = await updateSubgrupo(editingSubgrupo.id!, payload);
        setSubgrupos(subgrupos.map((s) => (s.id === editingSubgrupo.id ? { ...s, ...updated } : s)));
        setSuccessMessage('Subgrupo atualizado com sucesso!');
      } else {
        const payload = { ...(data || {}), id_categoria: categoryIdNum, id_grupo: grupoIdNum };
        const created = await createSubgrupo(payload);
        setSubgrupos([...subgrupos, created]);
        setSuccessMessage('Subgrupo criado com sucesso!');
      }
      handleClose();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao salvar subgrupo');
    }
  };

  const handleDeleteClick = (s: Subgrupo) => setConfirmDelete({ isOpen: true, subgrupo: s });

  const handleConfirmDelete = async () => {
    if (!confirmDelete.subgrupo?.id) return;
    try {
      await deleteSubgrupo(confirmDelete.subgrupo.id);
      setSubgrupos(subgrupos.filter((s) => s.id !== confirmDelete.subgrupo!.id));
      setSuccessMessage('Subgrupo deletado com sucesso!');
      setConfirmDelete({ isOpen: false, subgrupo: null });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao deletar subgrupo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="w-8 h-8 text-violet-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Subgrupos</h2>
            <p className="text-gray-600 mt-1">Gerenciar subgrupos do grupo {grupoIdNum}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/categorias/${categoryIdNum}/grupos`)} className="bg-gray-200 px-3 py-2 rounded">Voltar</button>
          <button onClick={handleNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"><Plus className="w-4 h-4"/> <span>Novo Subgrupo</span></button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">{successMessage}</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Carregando...</div>
        ) : subgrupos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum subgrupo cadastrado para este grupo.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descrição</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ativo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {subgrupos.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{s.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{s.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.descricao || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.ativo ? 'Sim' : 'Não'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-900 transition flex items-center gap-2 whitespace-nowrap"><Edit className="w-4 h-4"/> <span>Editar</span></button>
                      <button onClick={() => handleDeleteClick(s)} className="text-red-600 hover:text-red-900 transition flex items-center gap-2 whitespace-nowrap"><Trash2 className="w-4 h-4"/> <span>Deletar</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SubgrupoModal isOpen={modalOpen} subgrupo={editingSubgrupo} onClose={handleClose} onSubmit={handleSave} />

      {confirmDelete.isOpen && confirmDelete.subgrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja deletar o subgrupo <strong>{confirmDelete.subgrupo.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">Deletar</button>
              <button onClick={() => setConfirmDelete({ isOpen: false, subgrupo: null })} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubgruposList;
