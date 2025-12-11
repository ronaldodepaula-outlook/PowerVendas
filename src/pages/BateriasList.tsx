import { useEffect, useState } from 'react';
import { Battery, Plus, Edit, Trash2 } from 'lucide-react';
import {
  listBaterias,
  createBateria,
  updateBateria,
  deleteBateria,
  type Bateria,
} from '../services/baterias.service';
import BateriaModal from '../components/BateriaModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ConfirmDelete {
  isOpen: boolean;
  bateria: Bateria | null;
}

const BateriasList = () => {
  const [baterias, setBaterias] = useState<Bateria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBateria, setEditingBateria] = useState<Bateria | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>({
    isOpen: false,
    bateria: null,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carrega a lista de baterias
  const loadBaterias = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBaterias();
      setBaterias(data);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar baterias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaterias();
  }, []);

  // Filtra baterias por código ou modelo
  const filteredBaterias = baterias.filter(
    (bateria) =>
      (bateria.codigo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (bateria.modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Abre modal para criar nova bateria
  const handleNewBateria = () => {
    setEditingBateria(null);
    setModalOpen(true);
  };

  // Abre modal para editar bateria
  const handleEditBateria = (bateria: Bateria) => {
    setEditingBateria(bateria);
    setModalOpen(true);
  };

  // Fecha modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBateria(null);
  };

  // Salva bateria (criar ou atualizar)
  const handleSaveBateria = async (data: Partial<Bateria>) => {
    setError(null);
    try {
      if (editingBateria) {
        // Remove IDs e timestamps do payload antes de enviar (apenas necessários na URL)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, id_bateria, id_empresa, created_at, updated_at, ...updateData } = data;
        await updateBateria(editingBateria.id!, updateData);
        setSuccessMessage('Bateria atualizada com sucesso!');
        setBaterias(
          baterias.map((b) => (b.id === editingBateria.id ? { ...b, ...data } : b))
        );
      } else {
        const newBateria = await createBateria(data);
        setSuccessMessage('Bateria criada com sucesso!');
        setBaterias([...baterias, newBateria]);
      }
      handleCloseModal();

      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao salvar bateria');
    }
  };

  // Abre diálogo de confirmação para deletar
  const handleDeleteClick = (bateria: Bateria) => {
    setConfirmDelete({ isOpen: true, bateria });
  };

  // Confirma deletar bateria
  const handleConfirmDelete = async () => {
    if (!confirmDelete.bateria) return;

    try {
      await deleteBateria(confirmDelete.bateria.id!);
      setBaterias(baterias.filter((b) => b.id !== confirmDelete.bateria!.id));
      setSuccessMessage('Bateria deletada com sucesso!');
      setConfirmDelete({ isOpen: false, bateria: null });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao deletar bateria');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Battery className="w-8 h-8 text-yellow-500" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Baterias</h2>
            <p className="text-gray-600 mt-1">Gerenciar catálogo de baterias disponíveis</p>
          </div>
        </div>
        <button
          onClick={handleNewBateria}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span> Nova Bateria</span>
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Busca */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por código ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center text-gray-600 py-8">Carregando...</div>
      ) : error ? null : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredBaterias.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {baterias.length === 0 ? 'Nenhuma bateria cadastrada' : 'Nenhuma bateria encontrada'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Código</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Modelo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amperagem</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Garantia</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Preço Custo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Preço Venda</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Margem</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBaterias.map((bateria) => {
                    const margem = bateria.preco_venda && bateria.preco_custo
                      ? (((bateria.preco_venda - bateria.preco_custo) / bateria.preco_custo) * 100).toFixed(2)
                      : 0;

                    return (
                      <tr key={bateria.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{bateria.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{bateria.codigo}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{bateria.modelo}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{bateria.amperagem} Ah</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{bateria.garantia_meses} meses</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          R$ {typeof bateria.preco_custo === 'string' ? parseFloat(bateria.preco_custo).toFixed(2) : bateria.preco_custo.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          R$ {typeof bateria.preco_venda === 'string' ? parseFloat(bateria.preco_venda).toFixed(2) : bateria.preco_venda.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">{margem}%</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            bateria.ativo === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {bateria.ativo === 1 ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              onClick={() => handleEditBateria(bateria)}
                              className="text-blue-600 hover:text-blue-800 font-medium transition flex items-center gap-2 whitespace-nowrap"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(bateria)}
                              className="text-red-600 hover:text-red-800 font-medium transition flex items-center gap-2 whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Deletar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <BateriaModal
        isOpen={modalOpen}
        bateria={editingBateria}
        onClose={handleCloseModal}
        onSubmit={handleSaveBateria}
      />

      {/* Dialog de Confirmação de Deleção */}
      {confirmDelete.isOpen && confirmDelete.bateria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Você tem certeza que deseja deletar a bateria <strong>{confirmDelete.bateria.codigo} - {confirmDelete.bateria.modelo}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Deletar
              </button>
              <button
                onClick={() => setConfirmDelete({ isOpen: false, bateria: null })}
                className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BateriasList;
