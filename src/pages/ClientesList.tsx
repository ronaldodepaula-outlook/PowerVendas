import { useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, Truck, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  listClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente,
} from '../services/clientes.service';
import ClienteModal from '../components/ClienteModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ConfirmDelete {
  isOpen: boolean;
  cliente: Cliente | null;
}

const ClientesList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>({
    isOpen: false,
    cliente: null,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Carrega a lista de clientes
  const loadClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listClientes();
      setClientes(data);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // Filtra clientes por nome ou email
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abre modal para criar novo cliente
  const handleNewCliente = () => {
    setEditingCliente(null);
    setModalOpen(true);
  };

  // Abre modal para editar cliente
  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setModalOpen(true);
  };

  const navigate = useNavigate();

  const handleManageVeiculos = (cliente: Cliente) => {
    if (!cliente?.id) return;
    navigate(`/clientes/${cliente.id}/veiculos`);
  };

  // Fecha modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCliente(null);
  };

  // Salva cliente (criar ou atualizar)
  const handleSaveCliente = async (data: Partial<Cliente>) => {
    setError(null);
    try {
      if (editingCliente) {
        // Remove ID do payload antes de enviar (apenas necessário na URL)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, id_cliente, id_empresa, created_at, updated_at, ...updateData } = data;
        await updateCliente(editingCliente.id!, updateData);
        setSuccessMessage('Cliente atualizado com sucesso!');
        setClientes(
          clientes.map((c) => (c.id === editingCliente.id ? { ...c, ...data } : c))
        );
      } else {
        const newCliente = await createCliente(data);
        setSuccessMessage('Cliente criado com sucesso!');
        setClientes([...clientes, newCliente]);
      }
      handleCloseModal();

      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao salvar cliente');
    }
  };

  // Abre diálogo de confirmação para deletar
  const handleDeleteClick = (cliente: Cliente) => {
    setConfirmDelete({ isOpen: true, cliente });
  };

  // Confirma deletar cliente
  const handleConfirmDelete = async () => {
    if (!confirmDelete.cliente?.id) return;

    try {
      await deleteCliente(confirmDelete.cliente.id);
      setClientes(clientes.filter((c) => c.id !== confirmDelete.cliente!.id));
      setSuccessMessage('Cliente deletado com sucesso!');
      setConfirmDelete({ isOpen: false, cliente: null });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao deletar cliente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
            <p className="text-gray-600 mt-1">Gerenciar lista de clientes da empresa</p>
          </div>
        </div>
        <button
          onClick={handleNewCliente}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span> Novo Cliente</span>
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
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Carregando...</div>
        ) : filteredClientes.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Telefone</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-900">{cliente.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefone || '-'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/clientes/${cliente.id}`)}
                        className="text-gray-700 hover:text-gray-900 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver</span>
                      </button>
                      <button
                        onClick={() => handleEditCliente(cliente)}
                        className="text-blue-600 hover:text-blue-900 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleManageVeiculos(cliente)}
                        className="text-indigo-600 hover:text-indigo-900 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Veículos</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cliente)}
                        className="text-red-600 hover:text-red-900 transition flex items-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Deletar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Criar/Editar */}
      <ClienteModal
        isOpen={modalOpen}
        cliente={editingCliente}
        onClose={handleCloseModal}
        onSubmit={handleSaveCliente}
      />

      {/* Modal de Confirmação de Deleção */}
      {confirmDelete.isOpen && confirmDelete.cliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar o cliente <strong>{confirmDelete.cliente.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Deletar
              </button>
              <button
                onClick={() => setConfirmDelete({ isOpen: false, cliente: null })}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
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

export default ClientesList;
