import api from './api';

export interface Cliente {
  id_cliente?: number;
  id?: number;
  nome: string;
  telefone?: string;
  email?: string;
  endereco?: string | null;
  cidade?: string;
  estado?: string;
  cep?: string | null;
}

export interface Veiculo {
  id_veiculo?: number;
  id?: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
}

export interface Item {
  id_item?: number;
  id?: number;
  id_atendimento?: number;
  id_bateria?: number;
  quantidade: number;
  valor_unitario: string | number;
  valor_total: string | number;
  created_at?: string;
  garantia_restante_meses?: number;
  bateria?: BateriaResumo;
}

export interface AtendimentoPayload {
  id_cliente: number;
  id_veiculo: number;
  data_atendimento: string;
  observacoes?: string;
  itens: Array<{
    id_bateria: number;
    quantidade: number;
    valor_unitario: number | string;
  }>;
}

export interface BateriaResumo {
  id_bateria?: number;
  codigo?: string;
  modelo?: string;
  amperagem?: number;
  garantia_meses?: number;
  preco_venda?: string | number;
  preco_custo?: string | number;
  ativo?: number;
}

export interface Atendimento {
  id: number;
  id_empresa?: number;
  id_usuario?: number;
  clienteId: number;
  id_veiculo?: number;
  dataAtendimento: string;
  tipoServico?: string;
  descricao?: string;
  observacoes?: string;
  status: 'aberto' | 'em-andamento' | 'concluido' | 'cancelado';
  dataCriacao: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  valorServico?: number;
  tecnico?: string;
  cliente?: Cliente;
  veiculo?: Veiculo;
  itens?: Item[];
}

const base = '/atendimentos';

const mapAtendimento = (it: any): Atendimento => ({
  id: it.id_atendimento ?? it.id ?? 0,
  id_empresa: it.id_empresa,
  id_usuario: it.id_usuario,
  clienteId: it.id_cliente ?? it.clienteId ?? 0,
  id_veiculo: it.id_veiculo,
  dataAtendimento: it.data_atendimento ?? it.dataAtendimento ?? '',
  tipoServico: it.tipo_servico ?? it.tipoServico ?? '',
  descricao: it.descricao ?? '',
  observacoes: it.observacoes ?? '',
  status: (it.status ?? 'aberto') as 'aberto' | 'em-andamento' | 'concluido' | 'cancelado',
  dataCriacao: it.created_at ?? it.dataCriacao ?? '',
  dataPrevisao: it.data_previsao ?? it.dataPrevisao ?? undefined,
  dataConclusao: it.data_conclusao ?? it.dataConclusao ?? undefined,
  valorServico: typeof it.valor_servico === 'string' ? parseFloat(it.valor_servico) : (it.valor_servico ?? it.valorServico ?? undefined),
  tecnico: it.tecnico ?? it.nome_tecnico ?? undefined,
  cliente: it.cliente ? {
    id_cliente: it.cliente.id_cliente,
    nome: it.cliente.nome,
    telefone: it.cliente.telefone,
    email: it.cliente.email,
    endereco: it.cliente.endereco,
    cidade: it.cliente.cidade,
    estado: it.cliente.estado,
    cep: it.cliente.cep,
  } : undefined,
  veiculo: it.veiculo ? {
    id_veiculo: it.veiculo.id_veiculo,
    placa: it.veiculo.placa,
    modelo: it.veiculo.modelo,
    marca: it.veiculo.marca,
    ano: it.veiculo.ano,
  } : undefined,
  itens: it.itens ? it.itens.map((item: any) => ({
    id_item: item.id_item ?? item.id,
    id_atendimento: item.id_atendimento,
    id_bateria: item.id_bateria,
    quantidade: item.quantidade,
    valor_unitario: item.valor_unitario,
    valor_total: item.valor_total,
    created_at: item.created_at,
    garantia_restante_meses: item.garantia_restante_meses ?? item.garantia_restante_mes ?? undefined,
    bateria: item.bateria ? {
      id_bateria: item.bateria.id_bateria ?? item.bateria.id,
      codigo: item.bateria.codigo,
      modelo: item.bateria.modelo,
      amperagem: item.bateria.amperagem,
      garantia_meses: item.bateria.garantia_meses ?? item.bateria.garantiaMeses ?? undefined,
      preco_venda: item.bateria.preco_venda ?? item.bateria.precoVenda ?? undefined,
      preco_custo: item.bateria.preco_custo ?? item.bateria.precoCusto ?? undefined,
      ativo: item.bateria.ativo,
    } : undefined,
  })) : undefined,
});

export const listAtendimentos = async (): Promise<Atendimento[]> => {
  const resp = await api.get(base);
  const data = resp.data as any[];
  return data.map(mapAtendimento);
};

export const getAtendimento = async (id: number): Promise<Atendimento> => {
  const resp = await api.get(`${base}/${id}`);
  return mapAtendimento(resp.data);
};

export const createAtendimento = async (payload: Partial<Atendimento> | AtendimentoPayload): Promise<Atendimento> => {
  const resp = await api.post(base, payload);
  return mapAtendimento(resp.data);
};

export const updateAtendimento = async (
  id: number,
  payload: Partial<Atendimento>
): Promise<Atendimento> => {
  const resp = await api.put(`${base}/${id}`, payload);
  return mapAtendimento(resp.data);
};

export const atualizarStatusAtendimento = async (
  id: number,
  status: Atendimento['status']
): Promise<Atendimento> => {
  const resp = await api.patch(`${base}/${id}/status`, { status });
  return mapAtendimento(resp.data);
};

export const deleteAtendimento = async (id: number): Promise<void> => {
  await api.delete(`${base}/${id}`);
};
