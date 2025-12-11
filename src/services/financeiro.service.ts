import api from './api';

export interface Venda {
  id: number;
  clienteId: number;
  dataVenda: string;
  total: number;
  status: 'pendente' | 'pago' | 'cancelado';
  itens: VendaItem[];
}

export interface VendaItem {
  id?: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
}

export interface Recebimento {
  id: number;
  vendaId: number;
  valor: number;
  dataRecebimento: string;
  metodo: string;
}

export interface Relatorio {
  periodo: string;
  totalVendas: number;
  totalRecebido: number;
  totalPendente: number;
  margemLucro: number;
}

const base = '/financeiro';

export const listVendas = async (): Promise<Venda[]> => {
  const resp = await api.get(`${base}/vendas`);
  return resp.data;
};

export const getVenda = async (id: number): Promise<Venda> => {
  const resp = await api.get(`${base}/vendas/${id}`);
  return resp.data;
};

export const createVenda = async (payload: Partial<Venda>): Promise<Venda> => {
  const resp = await api.post(`${base}/vendas`, payload);
  return resp.data;
};

export const registrarRecebimento = async (
  payload: Partial<Recebimento>
): Promise<Recebimento> => {
  const resp = await api.post(`${base}/recebimentos`, payload);
  return resp.data;
};

export const getRelatorio = async (periodo: string): Promise<Relatorio> => {
  const resp = await api.get(`${base}/relatorio`, { params: { periodo } });
  return resp.data;
};

export const listRecebimentos = async (): Promise<Recebimento[]> => {
  const resp = await api.get(`${base}/recebimentos`);
  return resp.data;
};

// Contas a Receber / Contas a Pagar endpoints
export interface ContaReceber {
  id_conta_receber: number;
  id_empresa: number;
  id_atendimento: number;
  id_cliente: number;
  id_finalizadora: number | null;
  valor: string;
  data_vencimento: string;
  data_recebimento: string | null;
  status: 'pendente' | 'pago';
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id_conta_pagar: number;
  id_empresa: number;
  id_categoria: number | null;
  id_grupo: number | null;
  id_subgrupo: number | null;
  descricao: string;
  valor: string;
  data_vencimento: string;
  data_pagamento: string | null;
  id_finalizadora: number | null;
  status: 'pendente' | 'pago';
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export const listContasReceber = async (): Promise<ContaReceber[]> => {
  const resp = await api.get(`${base}/contas/receber`);
  return resp.data?.data ?? resp.data ?? [];
};

export const receberConta = async (id: number, payload: { data_recebimento: string; id_finalizadora: number; }) => {
  const resp = await api.post(`${base}/contas/receber/${id}/receber`, payload);
  return resp.data;
};

export const listContasPagar = async (): Promise<ContaPagar[]> => {
  const resp = await api.get(`${base}/contas/pagar`);
  return resp.data?.data ?? resp.data ?? [];
};

export const pagarConta = async (id: number, payload: { data_pagamento: string; id_finalizadora: number; }) => {
  const resp = await api.post(`${base}/contas/pagar/${id}/pagar`, payload);
  return resp.data;
};

export interface Fluxo {
  id_fluxo: number;
  id_empresa: number;
  tipo: 'entrada' | 'saida';
  valor: string;
  id_finalizadora: number;
  origem: 'conta_receber' | 'conta_pagar' | 'movimentacao';
  referencia_id: number;
  data_movimento: string;
  observacao: string | null;
  created_at: string;
}

export const getFluxo = async (): Promise<Fluxo[]> => {
  const resp = await api.get(`${base}/fluxo`);
  return resp.data ?? [];
};
