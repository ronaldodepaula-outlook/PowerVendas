import api from './api';

export interface Cliente {
  id?: number;
  id_cliente?: number;
  id_empresa?: number;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Veiculo {
  id?: number;
  id_veiculo?: number;
  id_empresa?: number;
  id_cliente?: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  created_at?: string;
  updated_at?: string;
}

// Mapeia resposta da API para formato interno
const mapClienteResponse = (data: any): Cliente => {
  return {
    id: data.id_cliente || data.id,
    id_cliente: data.id_cliente,
    id_empresa: data.id_empresa,
    nome: data.nome,
    telefone: data.telefone,
    email: data.email,
    endereco: data.endereco,
    cidade: data.cidade,
    estado: data.estado,
    cep: data.cep,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

const base = '/clientes';

export const listClientes = async (): Promise<Cliente[]> => {
  const resp = await api.get(base);
  return resp.data.map(mapClienteResponse);
};

export const getCliente = async (id: number): Promise<Cliente> => {
  const resp = await api.get(`${base}/${id}`);
  return mapClienteResponse(resp.data);
};

export const createCliente = async (payload: Partial<Cliente>): Promise<Cliente> => {
  const resp = await api.post(base, payload);
  return mapClienteResponse(resp.data);
};

export const updateCliente = async (id: number, payload: Partial<Cliente>): Promise<Cliente> => {
  const resp = await api.put(`${base}/${id}`, payload);
  return mapClienteResponse(resp.data);
};

export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};

// Mapeia resposta de veículo
const mapVeiculoResponse = (data: any): Veiculo => {
  return {
    id: data.id_veiculo || data.id,
    id_veiculo: data.id_veiculo,
    id_empresa: data.id_empresa,
    id_cliente: data.id_cliente,
    placa: data.placa,
    modelo: data.modelo,
    marca: data.marca,
    ano: data.ano,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

export const listVeiculosByCliente = async (clienteId: number): Promise<Veiculo[]> => {
  const resp = await api.get(`${base}/${clienteId}/veiculos`);
  // O endpoint pode retornar { data: [...] } ou diretamente [...]
  const data = resp.data.data || resp.data;
  return (Array.isArray(data) ? data : []).map(mapVeiculoResponse);
};

// Dashboard endpoint: /clientes/{id}/dashboard
export interface ClienteDashboard {
  cliente: Cliente;
  summary?: {
    veiculos_count?: number;
    atendimentos_count?: number;
    total_revenue?: string | number;
    last_purchase_date?: string | null;
    days_since_last_purchase?: number | null;
    status?: string | null;
  };
  veiculos?: Veiculo[];
  atendimentos?: any[];
  per_vehicle?: Array<{ id_veiculo?: number; placa?: string; count?: number; total?: number }>;
  warranty_items?: any[];
  notifications?: any[];
}

export const getClienteDashboard = async (clienteId: number): Promise<ClienteDashboard> => {
  const resp = await api.get(`${base}/${clienteId}/dashboard`);
  return resp.data as ClienteDashboard;
};
