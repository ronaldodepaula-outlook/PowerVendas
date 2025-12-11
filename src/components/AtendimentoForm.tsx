import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import type { Cliente, Veiculo } from '../services/clientes.service';
import { listClientes, listVeiculosByCliente } from '../services/clientes.service';
import { listBaterias } from '../services/baterias.service';
import { createAtendimento } from '../services/atendimentos.service';
import type { AtendimentoPayload } from '../services/atendimentos.service';
import DateTimePicker from './DateTimePicker';

interface BateriaComPreco {
  id_bateria: number;
  codigo: string;
  modelo: string;
  amperagem: number;
  garantia_meses: number;
  preco_venda: string | number;
  preco_custo?: string | number;
  ativo: number;
}

interface ItemVenda {
  id: string;
  id_bateria: number;
  quantidade: number;
  valor_unitario: number;
}

interface AtendimentoFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const AtendimentoForm: React.FC<AtendimentoFormProps> = ({ onSuccess, isModal = false }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [baterias, setBaterias] = useState<BateriaComPreco[]>([]);

  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [selectedVeiculoId, setSelectedVeiculoId] = useState<number | null>(null);
  const [dataAtendimento, setDataAtendimento] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carregar clientes e baterias ao montar
  useEffect(() => {
    const fetch = async () => {
      try {
        const [clientesList, bateriasList] = await Promise.all([
          listClientes(),
          listBaterias(),
        ]);
        setClientes(clientesList);
        setBaterias(bateriasList as BateriaComPreco[]);
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      }
    };
    fetch();
  }, []);

  // Carregar veículos quando cliente muda
  useEffect(() => {
    if (!selectedClienteId) {
      setVeiculos([]);
      setSelectedVeiculoId(null);
      return;
    }

    const fetch = async () => {
      try {
        const veucs = await listVeiculosByCliente(selectedClienteId);
        setVeiculos(veucs);
        setSelectedVeiculoId(null);
      } catch (err) {
        setError('Erro ao carregar veículos');
        console.error(err);
      }
    };
    fetch();
  }, [selectedClienteId]);

  const addItem = () => {
    const newItem: ItemVenda = {
      id: Math.random().toString(),
      id_bateria: baterias[0]?.id_bateria ?? 0,
      quantidade: 1,
      valor_unitario: baterias[0] ? Number(baterias[0].preco_venda) : 0,
    };
    setItens([...itens, newItem]);
  };

  const removeItem = (id: string) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemVenda, value: unknown) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Se mudar bateria, atualizar preço automaticamente
          if (field === 'id_bateria') {
            const bateria = baterias.find((b) => b.id_bateria === value);
            if (bateria) {
              updated.valor_unitario = Number(bateria.preco_venda);
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedClienteId || !selectedVeiculoId || !dataAtendimento || itens.length === 0) {
      setError('Preencha todos os campos obrigatórios e adicione pelo menos um item');
      return;
    }

    try {
      setLoading(true);
      // Converter datetime-local para formato esperado: "YYYY-MM-DD HH:MM:SS"
      // DateTimePicker retorna no formato "YYYY-MM-DDTHH:MM"
      const dtParts = dataAtendimento.split('T');
      const formattedDate = dtParts[1] ? `${dtParts[0]} ${dtParts[1]}:00` : dataAtendimento;
      
      const payload: AtendimentoPayload = {
        id_cliente: selectedClienteId,
        id_veiculo: selectedVeiculoId,
        data_atendimento: formattedDate,
        observacoes: observacoes || '',
        itens: itens.map(({ id_bateria, quantidade, valor_unitario }) => ({
          id_bateria: Number(id_bateria),
          quantidade: Number(quantidade),
          valor_unitario: Number(valor_unitario),
        })),
      };

      console.log('📤 Payload enviado:', JSON.stringify(payload, null, 2));
      await createAtendimento(payload);
      setSuccess(true);
      
      // Chamar callback se fornecido
      if (onSuccess) {
        setTimeout(onSuccess, 1500); // Aguardar mostrar mensagem de sucesso
      }
      
      // Reset form
      setSelectedClienteId(null);
      setSelectedVeiculoId(null);
      setDataAtendimento('');
      setObservacoes('');
      setItens([]);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Erro ao criar atendimento:', err);
      let errorMsg = 'Erro ao criar atendimento';
      
      if (err instanceof Error) {
        errorMsg = err.message;
        // Se for erro do axios, tentar extrair detalhes da resposta
        if ('response' in err && err.response && typeof err.response === 'object') {
          const respData = (err.response as Record<string, unknown>).data as Record<string, unknown> | undefined;
          if (respData?.message) {
            errorMsg = `Erro: ${respData.message}`;
            console.error('Detalhes da validação:', respData);
          }
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const totalVenda = itens.reduce(
    (acc, item) => acc + item.quantidade * item.valor_unitario,
    0
  );

  return (
    <div className={isModal ? '' : 'max-w-6xl mx-auto'}>
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex items-center gap-3">
          <div className="bg-white bg-opacity-20 p-2 rounded">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Nova Venda / Atendimento</h2>
            <p className="text-green-100 text-sm">Crie um novo atendimento de venda de baterias</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
            <p className="text-green-800 font-medium">✓ Atendimento criado com sucesso!</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seção Cliente e Veículo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={selectedClienteId ?? ''}
                onChange={(e) => setSelectedClienteId(Number(e.target.value) || null)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((c) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nome} - {c.cidade}/{c.estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Veículo *
              </label>
              <select
                value={selectedVeiculoId ?? ''}
                onChange={(e) => setSelectedVeiculoId(Number(e.target.value) || null)}
                required
                disabled={!selectedClienteId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Selecione um veículo</option>
                {veiculos.map((v) => (
                  <option key={v.id_veiculo} value={v.id_veiculo}>
                    {v.marca} {v.modelo} - {v.placa}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data do Atendimento *
              </label>
              <DateTimePicker
                value={dataAtendimento}
                onChange={setDataAtendimento}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                placeholder="Ex: Troca de bateria no local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Seção Itens */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Itens da Venda</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                Adicionar Item
              </button>
            </div>

            {itens.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">Nenhum item adicionado. Clique em "Adicionar Item" para começar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itens.map((item) => {
                  const bateria = baterias.find((b) => b.id_bateria === item.id_bateria);
                  return (
                    <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-green-300 transition">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Bateria
                          </label>
                          <select
                            value={item.id_bateria}
                            onChange={(e) => updateItem(item.id, 'id_bateria', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          >
                            {baterias.map((b) => (
                              <option key={b.id_bateria} value={b.id_bateria}>
                                {b.modelo} ({b.codigo}) - R$ {Number(b.preco_venda).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          {bateria && (
                            <p className="text-xs text-gray-500 mt-1">
                              Amperagem: {bateria.amperagem}Ah | Garantia: {bateria.garantia_meses} meses
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Quantidade
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantidade}
                            onChange={(e) => updateItem(item.id, 'quantidade', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Valor Unit.
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.valor_unitario}
                            onChange={(e) => updateItem(item.id, 'valor_unitario', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Subtotal
                          </label>
                          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-800">
                            R$ {(item.quantidade * item.valor_unitario).toFixed(2)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition flex items-center justify-center"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total da Venda</p>
                <p className="text-3xl font-bold text-green-700">R$ {totalVenda.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Itens</p>
                <p className="text-2xl font-semibold text-gray-900">{itens.length}</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="reset"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              onClick={() => {
                setSelectedClienteId(null);
                setSelectedVeiculoId(null);
                setDataAtendimento('');
                setObservacoes('');
                setItens([]);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || itens.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Atendimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AtendimentoForm;
