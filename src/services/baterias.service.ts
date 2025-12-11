import api from './api';

export interface Bateria {
  id?: number;
  id_bateria?: number;
  id_empresa?: number;
  codigo: string;
  modelo: string;
  amperagem: number;
  garantia_meses: number;
  preco_venda: number;
  preco_custo: number;
  id_categoria: number;
  id_grupo: number;
  id_subgrupo: number;
  ativo?: number;
  created_at?: string;
  updated_at?: string;
}

// Mapeia resposta da API para formato interno
const mapBateriaResponse = (data: Partial<Bateria> & Record<string, unknown>): Bateria => {
  return {
    id: data.id_bateria || data.id,
    id_bateria: data.id_bateria,
    id_empresa: data.id_empresa,
    codigo: data.codigo || '',
    modelo: data.modelo || '',
    amperagem: data.amperagem || 0,
    garantia_meses: data.garantia_meses || 0,
    preco_venda: typeof data.preco_venda === 'string' ? parseFloat(data.preco_venda) : (data.preco_venda || 0),
    preco_custo: typeof data.preco_custo === 'string' ? parseFloat(data.preco_custo) : (data.preco_custo || 0),
    id_categoria: data.id_categoria || 0,
    id_grupo: data.id_grupo || 0,
    id_subgrupo: data.id_subgrupo || 0,
    ativo: data.ativo !== undefined ? data.ativo : 1,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const base = '/baterias';

export const listBaterias = async (): Promise<Bateria[]> => {
  const resp = await api.get(base);
  return resp.data.map(mapBateriaResponse);
};

export const getBateria = async (id: number): Promise<Bateria> => {
  const resp = await api.get(`${base}/${id}`);
  return mapBateriaResponse(resp.data);
};

export const createBateria = async (payload: Partial<Bateria>): Promise<Bateria> => {
  const resp = await api.post(base, payload);
  return mapBateriaResponse(resp.data);
};

export const updateBateria = async (id: number, payload: Partial<Bateria>): Promise<Bateria> => {
  const resp = await api.put(`${base}/${id}`, payload);
  return mapBateriaResponse(resp.data);
};

export const deleteBateria = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};
