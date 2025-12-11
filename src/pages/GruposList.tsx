import React, { useEffect, useState } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  listGruposByCategoria,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  type Grupo,
} from '../services/grupos.service';
import GrupoModal from '../components/GrupoModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ConfirmDelete {
  isOpen: boolean;
  grupo: Grupo | null;
}

const GruposList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const categoriaId = Number(id);
  const navigate = useNavigate();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<Grupo | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>({ isOpen: false, grupo: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = async () => {
    if (!categoriaId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listGruposByCategoria(categoriaId);
      setGrupos(data);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleNew = () => {
    setEditingGrupo(null);
    setModalOpen(true);
  };

  const handleEdit = (g: Grupo) => {
    setEditingGrupo(g);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingGrupo(null);
  };

  const handleSave = async (data: Partial<Grupo>) => {
    setError(null);
    try {
      if (!categoriaId) throw new Error('Categoria inválida');
      if (editingGrupo) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id_grupo, id_categoria, id_empresa, created_at, updated_at, ...payload } = data as Partial<Grupo>;
        const updated = await updateGrupo(editingGrupo.id!, payload);
        setGrupos(grupos.map((g) => (g.id === editingGrupo.id ? { ...g, ...updated } : g)));
        setSuccessMessage('Grupo atualizado com sucesso!');
      } else {
        const payload = { ...(data || {}), id_categoria: categoriaId };
        const created = await createGrupo(payload);
        setGrupos([...grupos, created]);
        setSuccessMessage('Grupo criado com sucesso!');
      }
      handleClose();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao salvar grupo');
    }
  };

  const handleDeleteClick = (g: Grupo) => setConfirmDelete({ isOpen: true, grupo: g });

  const handleConfirmDelete = async () => {
    if (!confirmDelete.grupo?.id) return;
    try {
      await deleteGrupo(confirmDelete.grupo.id);
      setGrupos(grupos.filter((g) => g.id !== confirmDelete.grupo!.id));
      setSuccessMessage('Grupo deletado com sucesso!');
      setConfirmDelete({ isOpen: false, grupo: null });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao deletar grupo');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8 text-amber-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Grupos</h2>
            <p className="text-gray-600 mt-1">Gerenciar grupos da categoria {categoriaId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/categorias')} className="bg-gray-200 px-3 py-2 rounded">Voltar</button>
          <button onClick={handleNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"><Plus className="w-4 h-4"/> <span>Novo Grupo</span></button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">{successMessage}</div>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Carregando...</div>
        ) : grupos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum grupo cadastrado para esta categoria.</div>
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
              {grupos.map((g) => (
                <tr key={g.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{g.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{g.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.descricao || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{g.ativo ? 'Sim' : 'Não'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(g)} className="text-blue-600 hover:text-blue-900 transition flex items-center gap-2 whitespace-nowrap"><Edit className="w-4 h-4"/> <span>Editar</span></button>
                      <button onClick={() => navigate(`/categorias/${categoriaId}/grupos/${g.id}/subgrupos`)} className="text-indigo-600 hover:text-indigo-900 transition flex items-center gap-2 whitespace-nowrap"><span>Subgrupos</span></button>
                      <button onClick={() => handleDeleteClick(g)} className="text-red-600 hover:text-red-900 transition flex items-center gap-2 whitespace-nowrap"><Trash2 className="w-4 h-4"/> <span>Deletar</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <GrupoModal isOpen={modalOpen} grupo={editingGrupo} onClose={handleClose} onSubmit={handleSave} />

      {confirmDelete.isOpen && confirmDelete.grupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja deletar o grupo <strong>{confirmDelete.grupo.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">Deletar</button>
              <button onClick={() => setConfirmDelete({ isOpen: false, grupo: null })} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GruposList;
