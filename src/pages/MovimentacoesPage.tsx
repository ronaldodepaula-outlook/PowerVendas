import React, { useEffect, useState } from 'react';
import {
  listEstoque,
  getMovimentacoes,
  movimentarEstoqueAvulso,
  getBateria,
  type EstoqueItem,
  type MovimentacaoDetail,
  type MovimentacaoPayload,
} from '../services/estoque.service';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const MovimentacoesPage: React.FC = () => {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [selected, setSelected] = useState<EstoqueItem | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [valorUnitario, setValorUnitario] = useState<string>('0.00');
  const [origem, setOrigem] = useState<string>('ajuste');
  const [observacao, setObservacao] = useState<string>('');
  const [bateriaDetails, setBateriaDetails] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await listEstoque();
        setEstoque(list);
        if (list.length > 0) setSelected(list[0]);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar estoque');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const loadMov = async () => {
      try {
        setLoading(true);
        // prefer using the battery id (id_bateria / produtoId) for movimentacoes
        const estoqueIdForMov = (selected.produtoId && Number(selected.produtoId)) ? Number(selected.produtoId) : selected.id;
        const movs = await getMovimentacoes(estoqueIdForMov);
        setMovimentacoes(movs);
      } catch (err) {
        console.error(err);
        setError('Falha ao carregar movimentações');
      } finally {
        setLoading(false);
      }
    };
    loadMov();
  }, [selected]);

  // get auth user from context to check perfil
  const auth = useContext(AuthContext);
  const currentUser = auth?.user as Record<string, unknown> | null;

  // load bateria details (preco_custo / preco_venda) when selected changes
  useEffect(() => {
    if (!selected) return;
    const prodId = selected.produtoId ?? null;
    if (!prodId) {
      setBateriaDetails(null);
      return;
    }
    let mounted = true;
    const load = async () => {
      try {
        const bat = await getBateria(Number(prodId));
        if (!mounted) return;
        setBateriaDetails(bat ?? null);
        // set default valorUnitario depending on origem: if venda -> preco_venda else preco_custo
        const isVenda = origem === 'venda';
        const precoVenda = bat?.preco_venda ?? bat?.precoVenda ?? null;
        const precoCusto = bat?.preco_custo ?? bat?.precoCusto ?? null;
        if (isVenda && precoVenda != null) setValorUnitario(String(precoVenda));
        else if (!isVenda && precoCusto != null) setValorUnitario(String(precoCusto));
      } catch (err) {
        console.debug('Failed to load bateria details', err);
        setBateriaDetails(null);
      }
    };
    void load();
    return () => { mounted = false; };
  }, [selected, origem]);

  const handleSelect = (item: EstoqueItem) => {
    setSelected(item);
    setMovimentacoes([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      // basic client-side validation
      if (quantidade <= 0) {
        setError('Quantidade deve ser maior que zero');
        return;
      }
      setLoading(true);
      // build payload matching API expected keys
      // normalize numeric fields: quantidade and valor_unitario
      const parseNumber = (v: unknown): number | null => {
        if (v === null || v === undefined || v === '') return null;
        if (typeof v === 'number') return Number.isFinite(v) ? v : null;
        if (typeof v === 'string') {
          const s = v.trim().replace(/\./g, '').replace(/,/g, '.');
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      };

      const quantidadeNum = Number(quantidade) || 0;
      let valorUnitNum = parseNumber(valorUnitario);
      if (valorUnitNum === null) valorUnitNum = 0;

      // prefer explicit bateria id when available
      const idBateria = (selected.produtoId && Number(selected.produtoId)) ? Number(selected.produtoId) : selected.id;

      const payload: MovimentacaoPayload = {
        id_bateria: idBateria,
        tipo,
        origem: origem || 'avulso',
        quantidade: quantidadeNum,
        valor_unitario: valorUnitNum,
        observacao: observacao || null,
        id_referencia: null,
      };

      // Do not attach extra ids by default — send payload matching curl example
      const token = localStorage.getItem('empresa_token');
      console.debug('Movimentacao payload (sending):', payload, 'Authorization:', token ? `Bearer ${String(token).slice(0,8)}...` : 'none');
      // send and capture response for debugging
      const resp = await movimentarEstoqueAvulso(payload);
      // log full response when available
      console.debug('Movimentacao response:', resp);
      // reload
      const estoqueIdForMov = (selected.produtoId && Number(selected.produtoId)) ? Number(selected.produtoId) : selected.id;
      const movs = await getMovimentacoes(estoqueIdForMov);
      setMovimentacoes(movs);
      // reload estoque list
      const list = await listEstoque();
      setEstoque(list);
      const refreshed = list.find((l) => l.id === selected.id) ?? selected;
      setSelected(refreshed as EstoqueItem);
      setObservacao('');
    } catch (err: unknown) {
      console.error('Movimentar erro:', err);
      // Prefer structured API error message when available
      const apiErr = err as { response?: { data?: unknown }; message?: string };
      const apiData = apiErr.response?.data;
      let msg = 'Erro ao movimentar estoque';
      if (apiData) {
        if (typeof apiData === 'object' && apiData !== null) {
          const asRecord = apiData as Record<string, unknown>;
          const maybeMessage = asRecord['message'];
          if (typeof maybeMessage === 'string') msg = maybeMessage;
          else msg = JSON.stringify(apiData);
        } else {
          msg = String(apiData);
        }
      } else if (apiErr?.message) {
        msg = apiErr.message as string;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Itens em Estoque</h2>
        {loading && estoque.length === 0 ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : (
          <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
            {estoque.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`cursor-pointer p-3 rounded border ${selected?.id === item.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{item.localizacao || `Item #${item.id}`}</p>
                    <p className="text-xs text-gray-500">Quantidade: {item.quantidade}</p>
                  </div>
                </div>
              </li>
            ))}
            {estoque.length === 0 && <p className="text-sm text-gray-500">Nenhum item em estoque</p>}
          </ul>
        )}
      </div>

      <div className="col-span-2 space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-md font-semibold mb-4">Nova Movimentação</h3>
          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === 'entrada' || v === 'saida') setTipo(v);
                }}
                className="w-full mt-1 p-2 border rounded"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700">Quantidade</label>
              <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700">Valor Unitário</label>
              <input
                type="text"
                value={valorUnitario}
                onChange={(e) => setValorUnitario(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                readOnly={!(currentUser && String(currentUser?.perfil) === 'owner')}
              />
              {bateriaDetails && (
                <p className="text-xs text-gray-500 mt-1">Preços — Custo: {String(bateriaDetails.preco_custo ?? bateriaDetails.precoCusto ?? '—')}, Venda: {String(bateriaDetails.preco_venda ?? bateriaDetails.precoVenda ?? '—')}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700">Origem / Motivo</label>
              <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="w-full mt-1 p-2 border rounded">
                <option value="ajuste">ajuste</option>
                <option value="compra">compra</option>
                <option value="venda">venda</option>
                <option value="avulso">avulso</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm text-gray-700">Observação</label>
              <input type="text" value={observacao} onChange={(e) => setObservacao(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <button type="submit" disabled={!selected || loading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <CheckCircle className="w-4 h-4" />
                Registrar Movimentação
              </button>
              <button type="button" onClick={() => { setObservacao(''); setQuantidade(1); setValorUnitario('0.00'); }} className="inline-flex items-center gap-2 px-4 py-2 border rounded">
                <XCircle className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Movimentações</h2>
              <p className="text-sm text-gray-500">Mostrando movimentações do item selecionado</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{selected ? selected.localizacao : 'Nenhum item selecionado'}</p>
            </div>
          </div>

          <div className="mt-4">
            {loading && movimentacoes.length === 0 ? (
              <p className="text-sm text-gray-500">Carregando movimentações...</p>
            ) : movimentacoes.length > 0 ? (
              <div className="space-y-3">
                {movimentacoes.map((m) => (
                  <div key={m.id_movimentacao} className="border rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        {m.tipo === 'entrada' ? (
                          <ArrowDownCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{m.origem ?? '—'}</p>
                          <p className="text-xs text-gray-500">{m.usuario?.nome ?? m.usuario?.email ?? 'Usuário desconhecido'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{m.quantidade} un.</p>
                      <p className="text-xs text-gray-500">{m.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sem movimentações para este item</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovimentacoesPage;
