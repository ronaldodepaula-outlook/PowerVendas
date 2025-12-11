import React, { useState, useEffect } from 'react';
import { X, FileText, User, Truck, Calendar, Clock, MapPin, Phone, Mail, MapPinIcon, Gauge, ShoppingCart } from 'lucide-react';
import type { Atendimento } from '../services/atendimentos.service';
import { getAtendimento } from '../services/atendimentos.service';

interface AtendimentoDetailModalProps {
  isOpen: boolean;
  atendimento: Atendimento | null;
  onClose: () => void;
}

export const AtendimentoDetailModal: React.FC<AtendimentoDetailModalProps> = ({
  isOpen,
  atendimento,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'detalhes' | 'cliente' | 'veiculo' | 'itens'>('detalhes');
  const [detailedAtendimento, setDetailedAtendimento] = useState<Atendimento | null>(null);
  // Helper: parse date strings reliably and add months
  const parseDateString = (s?: string | null) => {
    if (!s) return null;
    try {
      let t = s;
      if (!/T/.test(t) && /\s/.test(t)) t = t.replace(' ', 'T');
      const d = new Date(t);
      if (!isNaN(d.getTime())) return d;
      // try with Z
      const d2 = new Date(t + 'Z');
      if (!isNaN(d2.getTime())) return d2;
    } catch {
      // fallthrough
    }
    return null;
  };

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // handle end-of-month overflow
    if (d.getDate() !== day) d.setDate(0);
    return d;
  };

  const computeWarranty = (item: Record<string, unknown>) => {
    // item.created_at (string) and item.bateria?.garantia_meses (number)
    const createdStr = (item['created_at'] as string) ?? (item['createdAt'] as string) ?? null;
    const created = parseDateString(createdStr);
    const bateria = item['bateria'] as { garantia_meses?: number } | undefined;
    const garantiaMonths = Number(bateria?.garantia_meses ?? (item['garantia_meses'] as number) ?? 0) || 0;
    if (!created || !garantiaMonths) return { remainingDays: null, expired: false, endDate: null };
    const endDate = addMonths(created, garantiaMonths);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { remainingDays: diffDays, expired: diffDays < 0, endDate };
  };
  useEffect(() => {
    if (isOpen && atendimento?.id) {
      getAtendimento(atendimento.id)
        .then((data) => {
          setDetailedAtendimento(data);
        })
        .catch((err) => {
          console.error('Erro ao carregar detalhe do atendimento:', err);
          setDetailedAtendimento(atendimento);
        });
    }
  }, [isOpen, atendimento?.id, atendimento]);

  if (!isOpen || !atendimento) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Atendimento #{atendimento.id}
              </h2>
              <p className="text-blue-100 text-sm">Visualizar detalhes completos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab('detalhes')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'detalhes'
                ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('cliente')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'cliente'
                ? 'border-b-4 border-green-600 text-green-600 bg-green-50'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            Cliente
          </button>
          <button
            onClick={() => setActiveTab('veiculo')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'veiculo'
                ? 'border-b-4 border-purple-600 text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            Veículo
          </button>

          <button
            onClick={() => setActiveTab('itens')}
            className={`flex-1 px-4 py-4 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'itens'
                ? 'border-b-4 border-orange-600 text-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-orange-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Itens
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-semibold text-blue-900">ID</label>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{atendimento.id}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-700">Status</span>
                  </div>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                    atendimento.status === 'concluido'
                      ? 'bg-green-100 text-green-800'
                      : atendimento.status === 'cancelado'
                      ? 'bg-red-100 text-red-800'
                      : atendimento.status === 'em-andamento'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {atendimento.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <label className="text-sm font-semibold text-purple-900">Data Atendimento</label>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(atendimento.dataAtendimento).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-purple-700 flex items-center gap-1 mt-1">
                    <Clock className="w-4 h-4" />
                    {new Date(atendimento.dataAtendimento).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <label className="text-sm font-semibold text-indigo-900">Criado em</label>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {new Date(atendimento.dataCriacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {atendimento.observacoes && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <label className="text-sm font-semibold text-amber-900">Observações</label>
                  </div>
                  <p className="text-gray-900">{atendimento.observacoes}</p>
                </div>
              )}

              {atendimento.tipoServico && (
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-5 h-5 text-teal-600" />
                    <label className="text-sm font-semibold text-teal-900">Tipo de Serviço</label>
                  </div>
                  <p className="text-gray-900">{atendimento.tipoServico}</p>
                </div>
              )}

              {atendimento.valorServico !== undefined && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-green-900">Valor</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">R$ {(atendimento.valorServico ?? 0).toFixed(2)}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cliente' && atendimento.cliente && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <label className="text-sm font-semibold text-green-900">Nome</label>
                </div>
                <p className="text-2xl font-bold text-green-800">{atendimento.cliente.nome}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-semibold text-blue-900">Email</label>
                  </div>
                  <p className="text-sm text-gray-900 break-all">{atendimento.cliente.email || '-'}</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-cyan-600" />
                    <label className="text-sm font-semibold text-cyan-900">Telefone</label>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">{atendimento.cliente.telefone || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <label className="text-sm font-semibold text-purple-900">Cidade</label>
                  </div>
                  <p className="text-gray-900 font-medium">{atendimento.cliente.cidade || '-'}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-pink-600" />
                    <label className="text-sm font-semibold text-pink-900">Estado</label>
                  </div>
                  <p className="text-gray-900 text-lg font-bold">{atendimento.cliente.estado || '-'}</p>
                </div>
              </div>

              {atendimento.cliente.endereco && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-5 h-5 text-orange-600" />
                    <label className="text-sm font-semibold text-orange-900">Endereço</label>
                  </div>
                  <p className="text-gray-900">{atendimento.cliente.endereco}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'veiculo' && atendimento.veiculo && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  <label className="text-sm font-semibold text-purple-900">Placa</label>
                </div>
                <p className="text-3xl font-bold text-purple-800 font-mono tracking-wider">{atendimento.veiculo.placa}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-red-600" />
                    <label className="text-sm font-semibold text-red-900">Marca</label>
                  </div>
                  <p className="text-xl font-bold text-red-800">{atendimento.veiculo.marca}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-semibold text-blue-900">Modelo</label>
                  </div>
                  <p className="text-xl font-bold text-blue-800">{atendimento.veiculo.modelo}</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <label className="text-sm font-semibold text-amber-900">Ano</label>
                </div>
                <p className="text-2xl font-bold text-amber-800">{atendimento.veiculo.ano}</p>
              </div>
            </div>
          )}

          {activeTab === 'itens' && (
            <div>
              {detailedAtendimento?.itens && detailedAtendimento.itens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-orange-50 border-b-2 border-orange-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-orange-900 font-semibold">ID Item</th>
                        <th className="px-4 py-3 text-left text-orange-900 font-semibold">Bateria / Código</th>
                        <th className="px-4 py-3 text-center text-orange-900 font-semibold">Qtd</th>
                        <th className="px-4 py-3 text-right text-orange-900 font-semibold">Valor Unit.</th>
                        <th className="px-4 py-3 text-center text-orange-900 font-semibold">Garantia</th>
                        <th className="px-4 py-3 text-right text-orange-900 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAtendimento.itens.map((item, idx) => {
                        const itemRec = item as unknown as Record<string, unknown>;
                        const w = computeWarranty(itemRec);
                        const idItem = itemRec['id_item'] ?? itemRec['id'] ?? idx;
                        const bateriaModelo = (itemRec['bateria'] as Record<string, unknown> | undefined)?.['modelo'] ?? (itemRec['bateria'] as Record<string, unknown> | undefined)?.['codigo'] ?? itemRec['id_bateria'];
                        const quantidade = Number(itemRec['quantidade'] ?? 0);
                        const valorUnit = Number(itemRec['valor_unitario'] ?? itemRec['preco_venda'] ?? 0);
                        const valorTotal = Number(itemRec['valor_total'] ?? 0);
                        return (
                          <tr key={String(idItem) + String(idx)} className="border-b border-orange-100 hover:bg-orange-50 transition">
                            <td className="px-4 py-3 font-medium text-gray-900">{String(idItem)}</td>
                            <td className="px-4 py-3 text-gray-800">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{String(bateriaModelo)}</span>
                                <div className="text-sm text-gray-600 mt-1">
                                  <span className="mr-3">Código: {String((itemRec['bateria'] as Record<string, unknown> | undefined)?.['codigo'] ?? '-')}</span>
                                  <span>Ah: {String((itemRec['bateria'] as Record<string, unknown> | undefined)?.['amperagem'] ?? '-')}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded">Garantia: {String(Number((itemRec['bateria'] as Record<string, unknown> | undefined)?.['garantia_meses'] ?? (itemRec['garantia_meses'] as number) ?? 0))} meses</span>
                                  <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 rounded">Restante: {String(itemRec['garantia_restante_meses'] ?? itemRec['garantia_restante_mes'] ?? '-') } meses</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-900">{quantidade}</td>
                            <td className="px-4 py-3 text-right text-gray-900">R$ {valorUnit.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              {w.remainingDays === null ? (
                                <span className="text-gray-500">N/A</span>
                              ) : !w.expired ? (
                                <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-800 rounded">{w.remainingDays} dias</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded">Expirada há {Math.abs(w.remainingDays)} dias</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-orange-700">R$ {valorTotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum item registrado neste atendimento</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cliente' && !atendimento.cliente && (
            <div className="text-gray-500 text-center py-8">
              Nenhuma informação de cliente disponível
            </div>
          )}

          {activeTab === 'veiculo' && !atendimento.veiculo && (
            <div className="text-gray-500 text-center py-8">
              Nenhuma informação de veículo disponível
            </div>
          )}

          {activeTab === 'itens' && (!detailedAtendimento?.itens || detailedAtendimento.itens.length === 0) && (
            <div className="text-gray-500 text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhum item registrado neste atendimento</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AtendimentoDetailModal;
