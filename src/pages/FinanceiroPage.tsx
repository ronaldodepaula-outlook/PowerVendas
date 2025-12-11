import { useEffect, useState } from 'react';
import {
  listVendas,
  getRelatorio,
  listContasReceber,
  listContasPagar,
  receberConta,
  pagarConta,
  getFluxo,
  type Fluxo,
} from '../services/financeiro.service';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

type TabType = 'dashboard' | 'receber' | 'pagar' | 'fluxo';

const FinanceiroPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contasReceber, setContasReceber] = useState<any[]>([]);
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [fluxo, setFluxo] = useState<Fluxo[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          listVendas(),
          getRelatorio('mes-atual'),
          listContasReceber(),
          listContasPagar(),
          getFluxo(),
        ]);

        const [, , rContasR, rContasP, rFluxo] = results;

        if (rContasR.status === 'fulfilled') setContasReceber(rContasR.value || []);
        else console.warn('Contas receber failed:', rContasR);

        if (rContasP.status === 'fulfilled') setContasPagar(rContasP.value || []);
        else console.warn('Contas pagar failed:', rContasP);

        if (rFluxo.status === 'fulfilled') setFluxo(rFluxo.value || []);
        else console.warn('Fluxo failed:', rFluxo);
      } catch (err: unknown) {
        const apiError = err as ErrorResponse;
        setError(apiError?.response?.data?.message || apiError?.message || 'Erro ao carregar dados financeiros');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Cálculos para o dashboard
  const totalReceber = contasReceber.reduce((sum, c) => sum + Number(c.valor), 0);
  const totalPagar = contasPagar.reduce((sum, c) => sum + Number(c.valor), 0);
  const recebido = contasReceber.filter(c => c.status === 'pago').reduce((sum, c) => sum + Number(c.valor), 0);
  const pago = contasPagar.filter(c => c.status === 'pago').reduce((sum, c) => sum + Number(c.valor), 0);
  const fluxoEntrada = fluxo.filter(f => f.tipo === 'entrada').reduce((sum, f) => sum + Number(f.valor), 0);
  const fluxoSaida = fluxo.filter(f => f.tipo === 'saida').reduce((sum, f) => sum + Number(f.valor), 0);
  const lucro = fluxoEntrada - fluxoSaida;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Financeiro</h2>
      </div>

      {loading && <div className="text-gray-600 bg-blue-50 p-4 rounded">Carregando dados financeiros...</div>}
      {error && <div className="text-red-600 bg-red-50 p-4 rounded">{error}</div>}

      {/* Abas de Navegação */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex space-x-1 px-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard Financeiro
          </button>
          <button
            onClick={() => setActiveTab('receber')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'receber'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contas a Receber ({contasReceber.length})
          </button>
          <button
            onClick={() => setActiveTab('pagar')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'pagar'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Contas a Pagar ({contasPagar.length})
          </button>
          <button
            onClick={() => setActiveTab('fluxo')}
            className={`px-4 py-3 font-medium transition ${
              activeTab === 'fluxo'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Fluxo de Caixa ({fluxo.length})
          </button>
        </div>
      </div>

      {/* DASHBOARD FINANCEIRO */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total a Receber</h3>
              <p className="text-3xl font-bold text-green-600">R$ {totalReceber.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{contasReceber.filter(c => c.status === 'pendente').length} pendentes</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Total a Pagar</h3>
              <p className="text-3xl font-bold text-red-600">R$ {totalPagar.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{contasPagar.filter(c => c.status === 'pendente').length} pendentes</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Lucro Líquido</h3>
              <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {lucro.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Baseado no fluxo de caixa</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
              <h3 className="text-gray-600 text-sm font-semibold mb-2">Saldo de Caixa</h3>
              <p className="text-3xl font-bold text-purple-600">R$ {(fluxoEntrada - fluxoSaida).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">Entrada: R$ {fluxoEntrada.toFixed(2)}</p>
            </div>
          </div>

          {/* Status de Pagamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-600">Recebimentos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Recebido</span>
                  <span className="font-bold text-green-600">R$ {recebido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Pendente</span>
                  <span className="font-bold text-yellow-600">R$ {(totalReceber - recebido).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="font-bold text-lg">R$ {totalReceber.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-600 h-full" 
                      style={{width: `${totalReceber > 0 ? (recebido / totalReceber) * 100 : 0}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalReceber > 0 ? `${((recebido / totalReceber) * 100).toFixed(1)}%` : '0%'} recebido
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Pagamentos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Pago</span>
                  <span className="font-bold text-green-600">R$ {pago.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Pendente</span>
                  <span className="font-bold text-red-600">R$ {(totalPagar - pago).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">Total</span>
                  <span className="font-bold text-lg">R$ {totalPagar.toFixed(2)}</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-600 h-full" 
                      style={{width: `${totalPagar > 0 ? (pago / totalPagar) * 100 : 0}%`}}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalPagar > 0 ? `${((pago / totalPagar) * 100).toFixed(1)}%` : '0%'} pago
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Possíveis Quebras - Movimentações não computadas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">⚠️ Possíveis Quebras</h3>
            <p className="text-gray-600 text-sm mb-4">
              Diferenças entre dados de fluxo de caixa e contas a receber/pagar
            </p>
            <div className="space-y-3">
              <div className="flex items-start justify-between p-3 bg-orange-50 rounded border border-orange-200">
                <div>
                  <p className="font-semibold text-gray-900">Movimentações não computadas em Contas</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Movimentos no fluxo de caixa que não possuem correspondência em contas a receber/pagar
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">
                    R$ {Math.abs(fluxo.length > 0 && contasReceber.length + contasPagar.length > 0 ? 
                      (fluxoEntrada + fluxoSaida) - (totalReceber + totalPagar) : 0).toFixed(2)}
                  </p>
                </div>
              </div>
              
              {fluxo.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Últimos movimentos</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {fluxo.slice(0, 5).map((f: Fluxo) => (
                      <div key={f.id_fluxo} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded text-sm">
                        <span className="text-gray-600">{f.origem} - {new Date(f.data_movimento).toLocaleDateString('pt-BR')}</span>
                        <span className={f.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {f.tipo === 'entrada' ? '+' : '−'} R$ {Number(f.valor).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONTAS A RECEBER */}
      {activeTab === 'receber' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Contas a Receber</h3>
          <div className="bg-white shadow rounded p-4">
            {contasReceber.length === 0 ? (
              <div className="text-gray-500">Nenhuma conta a receber.</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-semibold">ID</th>
                    <th className="pb-2 font-semibold">Cliente</th>
                    <th className="pb-2 font-semibold">Valor</th>
                    <th className="pb-2 font-semibold">Vencimento</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contasReceber.map((c: any) => {
                    const idConta = c.id_conta_receber;
                    const statusColor = c.status === 'pago' ? 'text-green-600' : 'text-yellow-600';
                    return (
                    <tr key={idConta} className="border-t hover:bg-gray-50">
                      <td className="py-2">{idConta}</td>
                      <td className="py-2">Cliente #{c.id_cliente}</td>
                      <td className="py-2 font-semibold">R$ {Number(c.valor).toFixed(2)}</td>
                      <td className="py-2">{c.data_vencimento}</td>
                      <td className={`py-2 font-medium ${statusColor}`}>{c.status}</td>
                      <td className="py-2">
                        {c.status !== 'pago' && (
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const payload = { data_recebimento: new Date().toISOString().slice(0,10), id_finalizadora: 1 };
                                await receberConta(idConta, payload);
                                const updated = await listContasReceber();
                                setContasReceber(updated);
                              } catch (e: any) {
                                alert(e?.response?.data?.message ?? e?.message ?? 'Erro ao receber conta');
                              } finally { setLoading(false); }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Receber
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CONTAS A PAGAR */}
      {activeTab === 'pagar' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Contas a Pagar</h3>
          <div className="bg-white shadow rounded p-4">
            {contasPagar.length === 0 ? (
              <div className="text-gray-500">Nenhuma conta a pagar.</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-semibold">ID</th>
                    <th className="pb-2 font-semibold">Descrição</th>
                    <th className="pb-2 font-semibold">Valor</th>
                    <th className="pb-2 font-semibold">Vencimento</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contasPagar.map((c: any) => {
                    const idConta = c.id_conta_pagar;
                    const statusColor = c.status === 'pago' ? 'text-green-600' : 'text-red-600';
                    return (
                    <tr key={idConta} className="border-t hover:bg-gray-50">
                      <td className="py-2">{idConta}</td>
                      <td className="py-2">{c.descricao ?? '—'}</td>
                      <td className="py-2 font-semibold">R$ {Number(c.valor).toFixed(2)}</td>
                      <td className="py-2">{c.data_vencimento ?? '—'}</td>
                      <td className={`py-2 font-medium ${statusColor}`}>{c.status}</td>
                      <td className="py-2">
                        {c.status !== 'pago' && (
                          <button
                            onClick={async () => {
                              try {
                                setLoading(true);
                                const payload = { data_pagamento: new Date().toISOString().slice(0,10), id_finalizadora: 2 };
                                await pagarConta(idConta, payload);
                                const updated = await listContasPagar();
                                setContasPagar(updated);
                              } catch (e: any) {
                                alert(e?.response?.data?.message ?? e?.message ?? 'Erro ao pagar conta');
                              } finally { setLoading(false); }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Pagar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FLUXO DE CAIXA */}
      {activeTab === 'fluxo' && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Fluxo de Caixa</h3>
          <div className="bg-white shadow rounded p-4">
            {fluxo.length === 0 ? (
              <div className="text-gray-500">Nenhum movimento de caixa.</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 font-semibold">ID</th>
                    <th className="pb-2 font-semibold">Data</th>
                    <th className="pb-2 font-semibold">Tipo</th>
                    <th className="pb-2 font-semibold">Origem</th>
                    <th className="pb-2 font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {fluxo.map((f: Fluxo) => {
                    const tipoColor = f.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
                    return (
                    <tr key={f.id_fluxo} className="border-t hover:bg-gray-50">
                      <td className="py-2">{f.id_fluxo}</td>
                      <td className="py-2">{new Date(f.data_movimento).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className={`py-2 ${tipoColor}`}>{f.tipo === 'entrada' ? '⬆ Entrada' : '⬇ Saída'}</td>
                      <td className="py-2 capitalize">{f.origem.replace('_', ' ')}</td>
                      <td className={`py-2 font-semibold ${f.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {f.tipo === 'entrada' ? '+' : '−'} R$ {Number(f.valor).toFixed(2)}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceiroPage;
