import { useEffect, useState } from 'react';
import { Headset, Plus, Eye } from 'lucide-react';
import { listAtendimentos, type Atendimento } from '../services/atendimentos.service';
import AtendimentoDetailModal from '../components/AtendimentoDetailModal';
import AtendimentoFormModal from '../components/AtendimentoFormModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

const AtendimentosList = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAtendimento, setSelectedAtendimento] = useState<Atendimento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listAtendimentos();
        setAtendimentos(data);
      } catch (err: unknown) {
        const apiError = err as ErrorResponse;
        setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar atendimentos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-yellow-100 text-yellow-800';
      case 'em-andamento':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDetailClick = (atendimento: Atendimento) => {
    setSelectedAtendimento(atendimento);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAtendimento(null);
  };

  const handleFormModalClose = () => {
    setFormModalOpen(false);
  };

  const handleFormSuccess = () => {
    // Recarregar lista de atendimentos após sucesso
    const load = async () => {
      try {
        const data = await listAtendimentos();
        setAtendimentos(data);
      } catch (err) {
        console.error('Erro ao recarregar atendimentos:', err);
      }
    };
    load();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Headset className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-semibold">Atendimentos</h2>
        </div>
        <button 
          onClick={() => setFormModalOpen(true)}
          className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Atendimento</span>
        </button>
      </div>

      {loading && <div className="text-gray-600">Carregando...</div>}
      {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

      {!loading && !error && (
        <div className="bg-white shadow rounded p-4">
          {atendimentos.length === 0 ? (
            <div className="text-gray-500">Nenhum atendimento encontrado.</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Cliente</th>
                  <th className="pb-2 font-semibold">Veículo</th>
                  <th className="pb-2 font-semibold">Data</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {atendimentos.map((a) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="py-2">{a.id}</td>
                    <td className="py-2">{a.cliente?.nome || `Cliente #${a.clienteId}`}</td>
                    <td className="py-2">{a.veiculo ? `${a.veiculo.marca} ${a.veiculo.modelo} (${a.veiculo.placa})` : '-'}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {new Date(a.dataAtendimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2 whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => handleDetailClick(a)}
                          className="text-blue-600 hover:text-blue-800 transition flex items-center gap-2 whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detalhes</span>
                        </button>
                        <button
                          className="text-gray-400 cursor-not-allowed"
                          disabled
                          title="Em desenvolvimento"
                        >
                          ✎
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <AtendimentoDetailModal
        isOpen={modalOpen}
        atendimento={selectedAtendimento}
        onClose={handleCloseModal}
      />

      <AtendimentoFormModal
        isOpen={formModalOpen}
        onClose={handleFormModalClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default AtendimentosList;
