import React, { useEffect, useState } from 'react';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type Categoria,
} from '../services/categorias.service';
import CategoriaModal from '../components/CategoriaModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ConfirmDelete {
  isOpen: boolean;
  categoria: Categoria | null;
}

const CategoriasList: React.FC = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>({ isOpen: false, categoria: null });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCategorias();
      setCategorias(data);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = categorias.filter((c) => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleNew = () => {
    setEditingCategoria(null);
    setModalOpen(true);
  };

  const handleEdit = (cat: Categoria) => {
    setEditingCategoria(cat);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingCategoria(null);
  };

  const handleSave = async (data: Partial<Categoria>) => {
    setError(null);
    try {
      if (editingCategoria) {
        // remove readonly props
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, id_categoria, id_empresa, created_at, updated_at, ...payload } = data as Partial<Categoria>;
        const updated = await updateCategoria(editingCategoria.id!, payload);
        setCategorias(categorias.map((c) => (c.id === editingCategoria.id ? { ...c, ...updated } : c)));
        setSuccessMessage('Categoria atualizada com sucesso!');
      } else {
        const created = await createCategoria(data);
        setCategorias([...categorias, created]);
        setSuccessMessage('Categoria criada com sucesso!');
      }
      handleClose();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao salvar categoria');
    }
  };

  const handleDeleteClick = (cat: Categoria) => setConfirmDelete({ isOpen: true, categoria: cat });

  const handleConfirmDelete = async () => {
    if (!confirmDelete.categoria?.id) return;
    try {
      await deleteCategoria(confirmDelete.categoria.id);
      setCategorias(categorias.filter((c) => c.id !== confirmDelete.categoria!.id));
      setSuccessMessage('Categoria deletada com sucesso!');
      setConfirmDelete({ isOpen: false, categoria: null });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      setError(apiErr?.response?.data?.message || apiErr?.message || 'Erro ao deletar categoria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-8 h-8 text-sky-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Categorias</h2>
            <p className="text-gray-600 mt-1">Gerenciar categorias usadas para agrupar baterias</p>
          </div>
        </div>
        <button onClick={handleNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"><Plus className="w-4 h-4"/> <span> Nova Categoria</span></button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">{successMessage}</div>}

      <div className="bg-white rounded-lg shadow p-4">
        <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{searchTerm ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria cadastrada.'}</div>
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
              {filtered.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{cat.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cat.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.descricao || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cat.ativo ? 'Sim' : 'Não'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-900 transition flex items-center gap-2 whitespace-nowrap"><Edit className="w-4 h-4"/> <span>Editar</span></button>
                      <button onClick={() => navigate(`/categorias/${cat.id}/grupos`)} className="text-indigo-600 hover:text-indigo-900 transition flex items-center gap-2 whitespace-nowrap"> <span>Grupos</span></button>
                      <button onClick={() => handleDeleteClick(cat)} className="text-red-600 hover:text-red-900 transition flex items-center gap-2 whitespace-nowrap"><Trash2 className="w-4 h-4"/> <span>Deletar</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CategoriaModal isOpen={modalOpen} categoria={editingCategoria} onClose={handleClose} onSubmit={handleSave} />

      {confirmDelete.isOpen && confirmDelete.categoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja deletar a categoria <strong>{confirmDelete.categoria.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={handleConfirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">Deletar</button>
              <button onClick={() => setConfirmDelete({ isOpen: false, categoria: null })} className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriasList;
