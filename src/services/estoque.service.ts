import api from './api';

export interface EstoqueItem {
  id: number;
  produtoId: number;
  quantidade: number;
  localizacao: string;
  dataAtualizacao: string;
}

export interface MovimentacaoEstoque {
  id?: number;
  itemId: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  dataMovimento?: string;
}

const base = '/estoque';

export const listEstoque = async (): Promise<EstoqueItem[]> => {
  const resp = await api.get(base);
  // API returns objects with fields like id_estoque, id_bateria, quantidade_atual, bateria, created_at, updated_at
  // Map them to the front-end shape expected by components
  const data = resp.data as any[];
  return data.map((it) => ({
    id: it.id_estoque ?? it.id ?? 0,
    produtoId: it.id_bateria ?? (it.bateria?.id_bateria ?? null),
    quantidade: it.quantidade_atual ?? it.quantidade ?? 0,
    // use bateria.modelo as localização/product name when available
    localizacao: it.localizacao ?? (it.bateria?.modelo ? `${it.bateria.codigo} - ${it.bateria.modelo}` : ''),
    dataAtualizacao: it.updated_at ?? it.created_at ?? '',
  }));
};

const mapItem = (it: any): EstoqueItem => ({
  id: it.id_estoque ?? it.id ?? 0,
  produtoId: it.id_bateria ?? (it.bateria?.id_bateria ?? null),
  quantidade: it.quantidade_atual ?? it.quantidade ?? 0,
  localizacao: it.localizacao ?? (it.bateria?.modelo ? `${it.bateria.codigo} - ${it.bateria.modelo}` : ''),
  dataAtualizacao: it.updated_at ?? it.created_at ?? '',
});

export const getEstoqueItem = async (id: number): Promise<EstoqueItem> => {
  const resp = await api.get(`${base}/${id}`);
  return mapItem(resp.data);
};

export const movimentarEstoque = async (
  payload: MovimentacaoEstoque
): Promise<MovimentacaoEstoque> => {
  const resp = await api.post(`${base}/movimentar`, payload);
  return resp.data;
};

// New helper to send payload formatted as API expects for movimetações avulsas
export interface MovimentacaoPayload {
  id_bateria: number;
  tipo: 'entrada' | 'saida' | string;
  origem?: string | null;
  quantidade: number;
  valor_unitario?: string | number | null;
  id_referencia?: number | null;
  observacao?: string | null;
}

export const movimentarEstoqueAvulso = async (
  payload: MovimentacaoPayload
): Promise<any> => {
  const resp = await api.post(`${base}/movimentar`, payload);
  return resp.data;
};

export const ajustarEstoque = async (
  id: number,
  quantidade: number,
  motivo: string
): Promise<EstoqueItem> => {
  const resp = await api.put(`${base}/${id}/ajustar`, { quantidade, motivo });
  return mapItem(resp.data);
};

export interface MovimentacaoDetail {
  id_movimentacao: number;
  id_empresa: number;
  id_bateria: number;
  id_usuario: number;
  tipo: 'entrada' | 'saida' | string;
  origem: string | null;
  quantidade: number;
  valor_unitario: string | number | null;
  id_referencia: number | null;
  observacao: string | null;
  created_at: string;
  empresa?: any;
  bateria?: any;
  usuario?: any;
}

export const getMovimentacoes = async (estoqueId: number): Promise<MovimentacaoDetail[]> => {
  const resp = await api.get(`${base}/${estoqueId}/movimentacoes`);
  // API returns { success: true, data: [...], total }
  const data = resp.data?.data ?? resp.data ?? [];
  return data as MovimentacaoDetail[];
};

// fetch bateria details by id_bateria
export const getBateria = async (id_bateria: number): Promise<any> => {
  const resp = await api.get(`/baterias/${id_bateria}`);
  return resp.data;
};
