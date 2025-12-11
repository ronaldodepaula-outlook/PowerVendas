import api from './api';

export interface Categoria {
  id?: number;
  id_categoria?: number;
  id_empresa?: number;
  nome: string;
  descricao?: string | null;
  ativo?: number;
  created_at?: string;
  updated_at?: string;
}

const mapCategoriaResponse = (data: Partial<Categoria> & Record<string, unknown>): Categoria => ({
  id: (data.id_categoria as number) || (data.id as number) || undefined,
  id_categoria: data.id_categoria as number | undefined,
  id_empresa: data.id_empresa as number | undefined,
  nome: (data.nome as string) || '',
  descricao: (data.descricao as string) || null,
  ativo: (data.ativo as number) || 0,
  created_at: data.created_at as string | undefined,
  updated_at: data.updated_at as string | undefined,
});

const base = '/categorias';

export const listCategorias = async (): Promise<Categoria[]> => {
  const resp = await api.get(base);
  const payload = resp.data?.data ?? resp.data;
  return (Array.isArray(payload) ? payload : []).map(mapCategoriaResponse);
};

export const getCategoria = async (id: number): Promise<Categoria> => {
  const resp = await api.get(`${base}/${id}`);
  const payload = resp.data?.data ?? resp.data;
  return mapCategoriaResponse(payload);
};

export const createCategoria = async (payload: Partial<Categoria>): Promise<Categoria> => {
  const resp = await api.post(base, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapCategoriaResponse(payloadData);
};

export const updateCategoria = async (id: number, payload: Partial<Categoria>): Promise<Categoria> => {
  const resp = await api.put(`${base}/${id}`, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapCategoriaResponse(payloadData);
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
