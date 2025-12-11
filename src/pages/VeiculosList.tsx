import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  listVeiculosByCliente,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
  type Veiculo,
} from '../services/veiculos.service';
import VeiculoModal from '../components/VeiculoModal';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

const VeiculosList = () => {
  const { id } = useParams<{ id: string }>();
  const clienteId = Number(id);
  const navigate = useNavigate();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Veiculo | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = async () => {
    if (!clienteId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listVeiculosByCliente(clienteId);
      setVeiculos(data);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleNew = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (v: Veiculo) => { setEditing(v); setModalOpen(true); };
  const handleClose = () => { setEditing(null); setModalOpen(false); };

  const handleSave = async (data: Partial<Veiculo>) => {
    setError(null);
    try {
      if (editing) {
        const { id: vid, id_veiculo, created_at, updated_at, ...payload } = data;
        await updateVeiculo(editing.id!, payload);
        setVeiculos(veiculos.map((v) => (v.id === editing.id ? { ...v, ...data } : v)));
        setSuccessMessage('Veículo atualizado com sucesso!');
      } else {
        // ensure we send id_cliente
        const newPayload = { ...(data as Partial<Veiculo>), id_cliente: clienteId };
        const created = await createVeiculo(newPayload);
        setVeiculos([...veiculos, created]);
        setSuccessMessage('Veículo criado com sucesso!');
      }
      handleClose();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao salvar veículo');
    }
  };

  const handleDelete = async (v: Veiculo) => {
    try {
      await deleteVeiculo(v.id!);
      setVeiculos(veiculos.filter((x) => x.id !== v.id));
      setSuccessMessage('Veículo removido com sucesso');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const apiError = err as ErrorResponse;
      setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao deletar veículo');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Veículos do Cliente</h2>
          <p className="text-gray-600 mt-1">Cliente ID: {clienteId}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/clientes')} className="px-3 py-2 bg-gray-200 rounded">Voltar</button>
          <button onClick={handleNew} className="px-3 py-2 bg-blue-600 text-white rounded">+ Novo Veículo</button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded">{successMessage}</div>}

      {loading ? (
        <div className="text-gray-600">Carregando...</div>
      ) : veiculos.length === 0 ? (
        <div className="text-gray-500">Nenhum veículo encontrado para este cliente.</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Placa</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Ano</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{v.id}</td>
                  <td className="px-4 py-3 font-medium">{v.placa}</td>
                  <td className="px-4 py-3">{v.modelo}</td>
                  <td className="px-4 py-3">{v.marca || '-'}</td>
                  <td className="px-4 py-3">{v.ano ?? '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(v)} className="text-blue-600 hover:text-blue-800">Editar</button>
                    <button onClick={() => handleDelete(v)} className="text-red-600 hover:text-red-800">Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VeiculoModal isOpen={modalOpen} veiculo={editing} onClose={handleClose} onSubmit={handleSave} />
    </div>
  );
};

export default VeiculosList;
