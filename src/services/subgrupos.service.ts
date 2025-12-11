import api from './api';

export interface Subgrupo {
  id?: number;
  id_subgrupo?: number;
  id_empresa?: number;
  id_categoria?: number;
  id_grupo?: number;
  nome: string;
  descricao?: string | null;
  ativo?: number;
  created_at?: string;
  updated_at?: string;
}

const mapSubgrupoResponse = (data: Partial<Subgrupo> & Record<string, unknown>): Subgrupo => ({
  id: (data.id_subgrupo as number) || (data.id as number) || undefined,
  id_subgrupo: data.id_subgrupo as number | undefined,
  id_empresa: data.id_empresa as number | undefined,
  id_categoria: data.id_categoria as number | undefined,
  id_grupo: data.id_grupo as number | undefined,
  nome: (data.nome as string) || '',
  descricao: (data.descricao as string) || null,
  ativo: (data.ativo as number) || 0,
  created_at: data.created_at as string | undefined,
  updated_at: data.updated_at as string | undefined,
});

const base = '/subgrupos';

export const listSubgruposByGrupo = async (idGrupo: number): Promise<Subgrupo[]> => {
  const resp = await api.get(`/grupos/${idGrupo}/subgrupos`);
  const payload = resp.data?.data ?? resp.data;
  return (Array.isArray(payload) ? payload : []).map(mapSubgrupoResponse);
};

export const getSubgrupo = async (id: number): Promise<Subgrupo> => {
  const resp = await api.get(`${base}/${id}`);
  const payload = resp.data?.data ?? resp.data;
  return mapSubgrupoResponse(payload);
};

export const createSubgrupo = async (payload: Partial<Subgrupo>): Promise<Subgrupo> => {
  const resp = await api.post(base, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapSubgrupoResponse(payloadData);
};

export const updateSubgrupo = async (id: number, payload: Partial<Subgrupo>): Promise<Subgrupo> => {
  const resp = await api.put(`${base}/${id}`, payload);
  const payloadData = resp.data?.data ?? resp.data;
  return mapSubgrupoResponse(payloadData);
};

export const deleteSubgrupo = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default {
  listSubgruposByGrupo,
  getSubgrupo,
  createSubgrupo,
  updateSubgrupo,
  deleteSubgrupo,
};
