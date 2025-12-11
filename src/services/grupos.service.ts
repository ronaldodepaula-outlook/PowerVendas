import api from './api';

export interface Grupo {
  id?: number;
  id_grupo?: number;
  id_empresa?: number;
  id_categoria?: number;
  nome: string;
  descricao?: string | null;
  ativo?: number;
  created_at?: string;
  updated_at?: string;
}

const mapGrupoResponse = (data: Partial<Grupo> & Record<string, unknown>): Grupo => ({
  id: (data.id_grupo as number) || (data.id as number) || undefined,
  id_grupo: data.id_grupo as number | undefined,
  id_empresa: data.id_empresa as number | undefined,
  id_categoria: data.id_categoria as number | undefined,
  nome: (data.nome as string) || '',
  descricao: (data.descricao as string) || null,
  ativo: (data.ativo as number) || 0,
  created_at: data.created_at as string | undefined,
  updated_at: data.updated_at as string | undefined,
});

const base = '/grupos';

export const listGruposByCategoria = async (idCategoria: number): Promise<Grupo[]> => {
  const resp = await api.get(`/categorias/${idCategoria}/grupos`);
  const payload = resp.data?.data ?? resp.data;
  return (Array.isArray(payload) ? payload : []).map(mapGrupoResponse);
};

export const getGrupo = async (id: number): Promise<Grupo> => {
  const resp = await api.get(`${base}/${id}`);
  const payload = resp.data?.data ?? resp.data;
  return mapGrupoResponse(payload);
};

export const createGrupo = async (payload: Partial<Grupo>): Promise<Grupo> => {
  const resp = await api.post(base, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapGrupoResponse(payloadData);
};

export const updateGrupo = async (id: number, payload: Partial<Grupo>): Promise<Grupo> => {
  const resp = await api.put(`${base}/${id}`, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapGrupoResponse(payloadData);
};

export const deleteGrupo = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default {
  listGruposByCategoria,
  getGrupo,
  createGrupo,
  updateGrupo,
  deleteGrupo,
};
