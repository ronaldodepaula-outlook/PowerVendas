import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Truck, ShoppingCart, Clock, AlertCircle } from 'lucide-react';
import { type Cliente, type Veiculo, getClienteDashboard, type ClienteDashboard } from '../../services/clientes.service';
import api from '../../services/api';

const ClienteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  interface AtendimentoItem { valor_total?: string | number; valor_unitario?: string | number; quantidade?: number; garantia_restante_meses?: number; bateria?: unknown; created_at?: string }
  interface AtendimentoType { id?: number; id_atendimento?: number; itens?: AtendimentoItem[]; clienteId?: number; data_atendimento?: string; veiculo?: { id_veiculo?: number; placa?: string } }
  const [atendimentos, setAtendimentos] = useState<AtendimentoType[]>([]);
  type VendaSummary = { total?: string | number; dataVenda?: string };
  const [vendas, setVendas] = useState<VendaSummary[]>([]);
  const [perVehicle, setPerVehicle] = useState<Array<{ id_veiculo?: number; placa?: string; count?: number; total?: number }>>([]);
  interface WarrantyItem {
    id_item?: number;
    id_bateria?: number;
    codigo?: string;
    modelo?: string;
    garantia_meses?: number;
    garantia_restante_meses?: number | null;
    purchase_date?: string;
    warranty_end?: string;
    days_remaining?: number; // days remaining when provided by dashboard
    status?: string;
    id_atendimento?: number; // some APIs use this name
    atendimentoId?: number; // fallback name used in computed list
    bateria?: { modelo?: string; codigo?: string } | null; // when dashboard returns nested bateria
    veiculo?: { id_veiculo?: number; placa?: string } | null;
  }
  const [warrantyItems, setWarrantyItems] = useState<WarrantyItem[]>([]);
  const [notifications, setNotifications] = useState<Array<{ message?: string; type?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'active'|'at-risk'|'dormant'>('active');

  // Types for raw atendimento data when we need to fetch details
  interface RawAtendimento { id?: number; id_atendimento?: number; itens?: Array<Record<string, unknown>>; data_atendimento?: string; veiculo?: { id_veiculo?: number; placa?: string } }
  // Helper: given an atendimento object, ensure it has itens with bateria/garantia data
  const ensureAtendimentoDetails = useCallback(async (a: RawAtendimento): Promise<RawAtendimento> => {
    const hasUsefulItem = Array.isArray(a?.itens) && a.itens.some(i => {
      if (typeof i !== 'object' || i == null) return false;
      const obj = i as Record<string, unknown>;
      return (obj['bateria'] != null) || (obj['garantia_restante_meses'] != null) || (obj['garantia_meses'] != null);
    });
    if (hasUsefulItem) return a;
    const atendimentoId = a?.id ?? a?.id_atendimento;
    if (!atendimentoId) return a;
    try {
      const resp = await api.get(`/atendimentos/${atendimentoId}`);
      return (resp.data as RawAtendimento) ?? a;
    } catch (e) {
      console.debug('Failed fetching atendimento details', atendimentoId, e);
      return a;
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        // Prefer the dashboard endpoint which returns consolidated data
        const dash = await getClienteDashboard(Number(id)) as ClienteDashboard;
        if (dash?.cliente) setCliente(dash.cliente);
        if (dash?.veiculos) setVeiculos(dash.veiculos);
        if (dash?.atendimentos) setAtendimentos(dash.atendimentos);
        if (dash?.per_vehicle) setPerVehicle(dash.per_vehicle);
        if (dash?.warranty_items) setWarrantyItems(dash.warranty_items);
        if (dash?.notifications) setNotifications(dash.notifications);

        // If the dashboard didn't return explicit warranty_items, try to derive them
        if ((!dash?.warranty_items || (Array.isArray(dash.warranty_items) && dash.warranty_items.length === 0)) && Array.isArray(dash?.atendimentos) && dash.atendimentos.length > 0) {
          const processed: WarrantyItem[] = [];
          const now = new Date();
          for (const aRaw of dash.atendimentos) {
            const full = await ensureAtendimentoDetails(aRaw as RawAtendimento);
            const itemsRaw = (full as RawAtendimento).itens;
            const itens: Array<Record<string, unknown>> = Array.isArray(itemsRaw) ? (itemsRaw as Array<Record<string, unknown>>) : [];
            for (const itemRaw of itens) {
              const item = itemRaw as Record<string, unknown>;
              const bateriaObj = (typeof item['bateria'] === 'object' && item['bateria'] != null) ? (item['bateria'] as Record<string, unknown>) : null;
              const garantiaMeses = bateriaObj && typeof bateriaObj['garantia_meses'] === 'number' ? (bateriaObj['garantia_meses'] as number) : (typeof item['garantia_meses'] === 'number' ? (item['garantia_meses'] as number) : null);
              const purchaseDate = typeof item['created_at'] === 'string' ? item['created_at'] as string : (typeof (full as RawAtendimento).data_atendimento === 'string' ? (full as RawAtendimento).data_atendimento as string : null);
              let daysRemaining: number | undefined = undefined;
              if (typeof item['garantia_restante_meses'] === 'number') {
                daysRemaining = Math.round((item['garantia_restante_meses'] as number) * 30);
              } else if (purchaseDate && typeof garantiaMeses === 'number') {
                const start = new Date(purchaseDate);
                const end = new Date(start);
                end.setMonth(end.getMonth() + garantiaMeses);
                daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              }
              processed.push({
                id_item: typeof item['id_item'] === 'number' ? (item['id_item'] as number) : (typeof item['id'] === 'number' ? (item['id'] as number) : undefined),
                id_bateria: typeof item['id_bateria'] === 'number' ? (item['id_bateria'] as number) : undefined,
                codigo: bateriaObj ? (bateriaObj['codigo'] as string) : (typeof item['codigo'] === 'string' ? (item['codigo'] as string) : undefined),
                modelo: bateriaObj ? (bateriaObj['modelo'] as string) : (typeof item['modelo'] === 'string' ? (item['modelo'] as string) : undefined),
                garantia_meses: garantiaMeses ?? undefined,
                garantia_restante_meses: typeof item['garantia_restante_meses'] === 'number' ? (item['garantia_restante_meses'] as number) : (daysRemaining != null ? Math.max(0, Math.floor(daysRemaining / 30)) : null),
                purchase_date: purchaseDate ?? undefined,
                days_remaining: daysRemaining,
                id_atendimento: (full as RawAtendimento).id ?? (full as RawAtendimento).id_atendimento,
                atendimentoId: (full as RawAtendimento).id ?? (full as RawAtendimento).id_atendimento,
                bateria: bateriaObj ? { modelo: bateriaObj['modelo'] as string | undefined, codigo: bateriaObj['codigo'] as string | undefined } : null,
                veiculo: (full as RawAtendimento).veiculo ? { id_veiculo: (full as RawAtendimento).veiculo?.id_veiculo, placa: (full as RawAtendimento).veiculo?.placa } : null,
              });
            }
          }
          if (processed.length > 0) setWarrantyItems(processed);
        }

        // derive vendas from atendimentos items if summary.total_revenue not provided
        if (dash?.summary?.total_revenue != null) {
          setVendas([{ total: dash.summary.total_revenue, dataVenda: String(dash.summary.last_purchase_date ?? '') }]);
        } else {
          // fallback: compute from atendimentos
          const computedTotal = (dash.atendimentos ?? []).reduce((sum: number, a: AtendimentoType) => {
            const items: AtendimentoItem[] = a.itens ?? [];
            const itemsTotal = items.reduce((s: number, it: AtendimentoItem) => s + (Number(it.valor_total ?? (Number(it.valor_unitario ?? 0) * Number(it.quantidade ?? 1))) || 0), 0);
            return sum + itemsTotal;
          }, 0);
          setVendas([{ total: computedTotal }]);
        }

        // set status from summary if available
        const s = dash?.summary?.status ?? null;
        if (s === 'ativo' || s?.toLowerCase() === 'ativo') setStatus('active');
        else if (s === 'at-risk' || s === 'em risco' || s === 'risco') setStatus('at-risk');
        else setStatus('dormant');
      } catch (err) {
        console.error('Failed loading cliente dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, ensureAtendimentoDetails]);

  // totals derived from atendimentos (items attended are considered vendas)
  const totalAtendimentos = atendimentos.length;
  const totalAtendidosValue = atendimentos.reduce((sum: number, a: AtendimentoType) => {
    const items: AtendimentoItem[] = a.itens ?? [];
    const itemsTotal = items.reduce((s: number, it: AtendimentoItem) => {
      const valorTotal = it.valor_total ?? (it.valor_unitario ? (Number(it.valor_unitario) * Number(it.quantidade ?? 1)) : 0);
      return s + (Number(valorTotal) || 0);
    }, 0);
    return sum + itemsTotal;
  }, 0);
  // For client-facing label, purchases == attended items total
  const totalCompras = totalAtendidosValue;
  const totalVendas = totalAtendidosValue;

  // warranty checks: find items with garantia remaining or about to expire (<= 2 months)
  // prefer warranty_items returned by dashboard when available
  // normalize warranty items to compute days/months remaining from available fields
  type NormalizedWarranty = WarrantyItem & { daysRemaining?: number | null; monthsRemaining?: number | null; expiryDate?: Date | null; expiryTimestamp?: number | undefined };
  let normalizedWarranty: NormalizedWarranty[] = [];
  if (warrantyItems && warrantyItems.length > 0) {
    const now = new Date();
    normalizedWarranty = warrantyItems.map(w => {
      let days: number | null | undefined = null;
      let expiryDate: Date | null = null;
      if (typeof w.days_remaining === 'number') {
        days = w.days_remaining;
        expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      } else if (typeof w.garantia_restante_meses === 'number') {
        days = Math.round(w.garantia_restante_meses * 30);
        expiryDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
      } else if (w.purchase_date && typeof w.garantia_meses === 'number') {
        const start = new Date(w.purchase_date);
        const end = new Date(start);
        end.setMonth(end.getMonth() + (w.garantia_meses ?? 0));
        expiryDate = end;
        days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      const months = days != null && typeof days === 'number' ? Math.max(0, Math.floor(days / 30)) : null;
      const expiryTimestamp = expiryDate ? expiryDate.getTime() : undefined;
      return { ...w, daysRemaining: days, monthsRemaining: months, expiryDate, expiryTimestamp } as NormalizedWarranty & { expiryDate?: Date | null; expiryTimestamp?: number | undefined };
    });

    // noj: we keep normalizedWarranty and group/sort by expiry below
  }

  // Group warranties by vehicle to show vehicles with valid and expired warranties
  const warrantiesByVehicle = new Map<string, { placa?: string; id_veiculo?: number | undefined; items: NormalizedWarranty[] }>();
  for (const w of normalizedWarranty) {
    const vid = w.veiculo?.id_veiculo ?? String(w.atendimentoId ?? w.id_atendimento ?? 'sem-veiculo');
    const key = String(vid ?? 'sem-veiculo');
    const placa = w.veiculo?.placa ?? undefined;
    const entry = warrantiesByVehicle.get(key) ?? { placa, id_veiculo: typeof vid === 'number' ? (vid as number) : undefined, items: [] };
    entry.items.push(w);
    warrantiesByVehicle.set(key, entry);
  }
  const sortByEarliestExpiry = (a: { items: NormalizedWarranty[] }, b: { items: NormalizedWarranty[] }) => {
    const aMin = Math.min(...a.items.map(it => it.expiryTimestamp ?? Number.POSITIVE_INFINITY));
    const bMin = Math.min(...b.items.map(it => it.expiryTimestamp ?? Number.POSITIVE_INFINITY));
    return aMin - bMin;
  };
  const vehiclesWithValidWarranty = Array.from(warrantiesByVehicle.values()).filter(v => v.items.some(i => (i.daysRemaining ?? 0) > 0)).sort(sortByEarliestExpiry);
  const vehiclesWithExpiredWarranty = Array.from(warrantiesByVehicle.values()).filter(v => v.items.every(i => (i.daysRemaining ?? -1) <= 0)).sort(sortByEarliestExpiry);

  // Export CSV helper
  const exportWarrantiesCSV = () => {
    const rows: string[] = [];
    const headers = ['veiculo_id','placa','atendimento_id','id_item','id_bateria','modelo','codigo','daysRemaining','monthsRemaining','expiryDate'];
    rows.push(headers.join(','));
    for (const w of normalizedWarranty) {
      const row = [
        String(w.veiculo?.id_veiculo ?? ''),
        String(w.veiculo?.placa ?? ''),
        String(w.atendimentoId ?? w.id_atendimento ?? ''),
        String(w.id_item ?? ''),
        String(w.id_bateria ?? ''),
        String(w.modelo ?? ''),
        String(w.codigo ?? ''),
        String(w.daysRemaining ?? ''),
        String(w.monthsRemaining ?? ''),
        w.expiryDate ? w.expiryDate.toISOString() : '',
      ];
      rows.push(row.map(r => '"' + String(r).replace(/"/g, '""') + '"').join(','));
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garantias_cliente_${cliente?.id ?? id ?? 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-4 bg-white rounded shadow text-gray-600">Carregando detalhes do cliente...</div>
      )}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{cliente?.nome ?? 'Detalhes do Cliente'}</h1>
          <p className="text-sm text-gray-500">ID: {cliente?.id ?? '-' } • Email: {cliente?.email ?? '-'}</p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'active'|'at-risk'|'dormant')} className="p-1 border rounded text-sm">
              <option value="active">Ativo</option>
              <option value="at-risk">Em risco</option>
              <option value="dormant">Inativo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Total Vendas (itens atendidos)</p>
              <p className="text-lg font-semibold">R$ {Number(vendas[0]?.total ?? totalVendas).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Compras (cliente)</p>
                <p className="text-lg font-semibold">R$ {Number(vendas[0]?.total ?? totalCompras).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">Veículos</p>
              <p className="text-lg font-semibold">{veiculos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">Atendimentos</p>
              <p className="text-lg font-semibold">{totalAtendimentos}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold mb-3">Atendimentos / Garantias</h3>
            <div className="flex items-center gap-2">
              <button onClick={exportWarrantiesCSV} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Exportar CSV</button>
            </div>
          </div>

          {/* Detailed warranty items: expiring first, then valid */}
          {normalizedWarranty.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium text-yellow-700">Itens em Garantia (detalhes)</h4>
              <ul className="mt-2 space-y-2">
                {normalizedWarranty
                  .slice()
                  .sort((a, b) => ((a.expiryTimestamp ?? Number.POSITIVE_INFINITY) - (b.expiryTimestamp ?? Number.POSITIVE_INFINITY)))
                  .map((w, idx) => (
                    <li key={idx} className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{w.bateria?.modelo ?? w.modelo ?? w.codigo ?? 'Bateria'}</p>
                            <p className="text-xs text-gray-500">Veículo: {w.veiculo?.placa ?? '—'}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {typeof w.daysRemaining === 'number' ? (
                            <>
                              <span>{w.daysRemaining} dias</span>
                              <span className="mx-2">•</span>
                              <span>{w.monthsRemaining} meses</span>
                            </>
                          ) : (
                            <span className="text-gray-500">Sem informação de tempo</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* badge */}
                        {typeof w.daysRemaining === 'number' && w.daysRemaining > 0 ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Vigente</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Expirada</span>
                        )}

                        {/* open atendimento */}
                        <button onClick={() => navigate(`/atendimentos/${w.atendimentoId ?? w.id_atendimento}`)} className="text-xs text-blue-600 underline">Abrir atendimento</button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum item com garantia registrado para este cliente.</p>
          )}
        </div>

        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Resumo Rápido</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between"><span>Compras</span><strong>R$ {totalVendas.toFixed(2)}</strong></div>
            <div className="flex items-center justify-between"><span>Atendimentos</span><strong>{totalAtendimentos}</strong></div>
            <div className="flex items-center justify-between"><span>Veículos</span><strong>{veiculos.length}</strong></div>
          </div>
          <div className="mt-4">
            <h4 className="font-medium">Últimas Vendas</h4>
            <ul className="mt-2 space-y-2 text-sm">
              {vendas.slice(0,5).map((v, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div>{v.dataVenda}</div>
                  <div>R$ {Number(v.total || 0).toFixed(2)}</div>
                </li>
              ))}
              {vendas.length === 0 && <li className="text-gray-500">Sem vendas para este cliente</li>}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Per-vehicle breakdown */}
      {perVehicle.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-medium mb-2">Resumo por Veículo</h4>
          <ul className="text-sm space-y-2">
            {perVehicle.map((pv) => (
              <li key={pv.id_veiculo} className="flex justify-between">
                <div>{pv.placa}</div>
                <div>{pv.count} atendimentos • R$ {Number(pv.total ?? 0).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Garantias por veículo */}
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium mb-3">Garantias por Veículo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-green-700">Vigentes</h5>
            {vehiclesWithValidWarranty.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum veículo com garantia vigente.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {vehiclesWithValidWarranty.map((v, i) => (
                  <li key={String(v.id_veiculo ?? i)} className="p-2 border rounded">
                    <div className="font-medium">{v.placa ?? 'Sem placa'}</div>
                    <ul className="mt-1 text-xs text-gray-700">
                      {v.items.map((it, j) => (
                        <li key={j} className="flex justify-between">
                          <div>{it.bateria?.modelo ?? it.modelo ?? it.codigo ?? 'Bateria'}</div>
                          <div className="text-right">
                            {typeof it.daysRemaining === 'number' ? (
                              <span>{it.daysRemaining} dias • {it.monthsRemaining} meses</span>
                            ) : (
                              <span className="text-gray-500">Sem informação</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h5 className="text-sm font-medium text-red-700">Expiradas</h5>
            {vehiclesWithExpiredWarranty.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum veículo com garantia expirada.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-sm">
                {vehiclesWithExpiredWarranty.map((v, i) => (
                  <li key={String(v.id_veiculo ?? i)} className="p-2 border rounded">
                    <div className="font-medium">{v.placa ?? 'Sem placa'}</div>
                    <ul className="mt-1 text-xs text-gray-700">
                      {v.items.map((it, j) => (
                        <li key={j} className="flex justify-between">
                          <div>{it.bateria?.modelo ?? it.modelo ?? it.codigo ?? 'Bateria'}</div>
                          <div className="text-right text-red-600">Expirada</div>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-4 rounded shadow">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h4 className="font-medium">Notificações</h4>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma notificação</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {notifications.map((n, i) => (
              <li key={i} className="flex justify-between">
                <div>{n.message ?? JSON.stringify(n)}</div>
                <div className="text-xs text-gray-400">{n.type ?? ''}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ClienteDetails;
