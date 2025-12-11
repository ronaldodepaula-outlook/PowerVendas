import api from './api';

export interface Veiculo {
  id?: number;
  id_veiculo?: number;
  id_empresa?: number;
  id_cliente?: number;
  placa: string;
  modelo: string;
  marca?: string | null;
  ano?: number | null;
  cor?: string | null;
  created_at?: string;
  updated_at?: string;
}

const mapVeiculoResponse = (data: Partial<Veiculo> & Record<string, unknown>): Veiculo => ({
  id: (data.id_veiculo as number) || (data.id as number) || undefined,
  id_veiculo: data.id_veiculo as number | undefined,
  id_empresa: data.id_empresa as number | undefined,
  id_cliente: data.id_cliente as number | undefined,
  placa: (data.placa as string) || '',
  modelo: (data.modelo as string) || '',
  marca: (data.marca as string) || null,
  ano: (data.ano as number) || null,
  cor: (data.cor as string) || null,
  created_at: data.created_at as string | undefined,
  updated_at: data.updated_at as string | undefined,
});

const base = '/veiculos';

export const listVeiculosByCliente = async (idCliente: number): Promise<Veiculo[]> => {
  const resp = await api.get(`/clientes/${idCliente}/veiculos`);
  // Some responses come wrapped in {success,data,total}
  const payload = resp.data?.data ?? resp.data;
  return (Array.isArray(payload) ? payload : []).map(mapVeiculoResponse);
};

export const getVeiculo = async (id: number): Promise<Veiculo> => {
  const resp = await api.get(`${base}/${id}`);
  return mapVeiculoResponse(resp.data);
};

export const createVeiculo = async (payload: Partial<Veiculo>): Promise<Veiculo> => {
  const resp = await api.post(base, payload);
  return mapVeiculoResponse(resp.data);
};

export const updateVeiculo = async (id: number, payload: Partial<Veiculo>): Promise<Veiculo> => {
  const resp = await api.put(`${base}/${id}`, payload);
  return mapVeiculoResponse(resp.data);
};

export const deleteVeiculo = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

export default {
  listVeiculosByCliente,
  getVeiculo,
  createVeiculo,
  updateVeiculo,
  deleteVeiculo,
};
