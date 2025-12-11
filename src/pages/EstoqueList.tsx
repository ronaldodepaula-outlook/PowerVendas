import { useEffect, useState } from 'react';
import { listEstoque, type EstoqueItem } from '../services/estoque.service';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

const EstoqueList = () => {
  const [itens, setItens] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listEstoque();
        setItens(data);
      } catch (err: unknown) {
        const apiError = err as ErrorResponse;
        setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar estoque');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Estoque</h2>
        <button className="px-3 py-1 bg-green-600 text-white rounded">
          Movimentação
        </button>
      </div>

      {loading && <div className="text-gray-600">Carregando...</div>}
      {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

      {!loading && !error && (
        <div className="bg-white shadow rounded p-4">
          {itens.length === 0 ? (
            <div className="text-gray-500">Nenhum item no estoque.</div>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-semibold">ID</th>
                  <th className="pb-2 font-semibold">Produto ID</th>
                  <th className="pb-2 font-semibold">Quantidade</th>
                  <th className="pb-2 font-semibold">Localização</th>
                  <th className="pb-2 font-semibold">Última Atualização</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, idx) => (
                  <tr key={item.id ?? item.produtoId ?? idx} className="border-t hover:bg-gray-50">
                    <td className="py-2">{item.id}</td>
                    <td className="py-2">{item.produtoId}</td>
                    <td className="py-2 font-semibold">{item.quantidade}</td>
                    <td className="py-2">{item.localizacao}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {new Date(item.dataAtualizacao).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default EstoqueList;
