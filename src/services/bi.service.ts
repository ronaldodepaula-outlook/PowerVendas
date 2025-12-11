import api from './api';

export interface DashboardData {
  id_empresa: number;
  razao_social: string;
  nome_fantasia: string;
  total_clientes: number;
  total_veiculos: number;
  total_atendimentos: number;
  atendimentos_concluidos: number;
  valor_total_recebido: string | number;
  valor_total_pendente: string | number;
  valor_contas_pagar_pago: string | number;
  valor_contas_pagar_pendente: string | number;
  total_itens_estoque: string | number;
  created_at: string;
  data_consulta: string;
}

export interface VendaMensal {
  id_empresa: number;
  mes: string;
  total_vendas: string | number;
}

export interface DespesaMensal {
  id_empresa: number;
  mes: string;
  total_despesas: string | number;
}

export interface LucroMensal {
  id_empresa: number;
  mes: string;
  lucro: string | number;
}

export interface TopProduto {
  id_empresa: number;
  id_bateria: number;
  modelo: string;
  amperagem: number;
  total_vendido: string | number;
  faturamento: string | number;
}

export interface EstoqueAnalitico {
  id_empresa: number;
  id_bateria: number;
  codigo: string;
  modelo: string;
  amperagem: number;
  quantidade_atual: number;
  valor_estoque_custo: string | number;
  valor_estoque_venda: string | number;
  giro_3_meses: string | number | null;
  cobertura_dias: number | null;
  markup: string | number;
  preco_venda: string | number;
  preco_custo: string | number;
}

const base = '/bi';

export const getDashboard = async (): Promise<DashboardData> => {
  const resp = await api.get(`${base}/dashboard`);
  return resp.data.data;
};

export const getVendasMensal = async (): Promise<VendaMensal[]> => {
  // Try multiple possible endpoints to be resilient to API path differences
  const candidates = [
    `${base}/financeiro/vendas-mensal`, // preferred BI namespace
    `/financeiro/vendas-mensal`,
    `/financeiro/vendas`,
  ];

  for (const path of candidates) {
    try {
      const resp = await api.get(path);
      // try to normalize response shapes
      const data = resp.data?.data ?? resp.data ?? [];
      return data as VendaMensal[];
    } catch (err: unknown) {
      // if 404 try next candidate, otherwise rethrow
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status && status === 404) {
        // try next
        continue;
      }
      // for other errors, rethrow so caller can handle
      throw err;
    }
  }

  // none succeeded, return empty
  return [];
};

export const getDespesasMensal = async (): Promise<DespesaMensal[]> => {
  const resp = await api.get(`${base}/financeiro/despesas-mensal`);
  return resp.data.data || [];
};

export const getLucroMensal = async (): Promise<LucroMensal[]> => {
  const resp = await api.get(`${base}/financeiro/lucro-mensal`);
  return resp.data.data || [];
};

export const getTopProdutos = async (): Promise<TopProduto[]> => {
  const resp = await api.get(`${base}/vendas/top-produtos`);
  return resp.data.data || [];
};

export const getEstoqueAnalitico = async (): Promise<EstoqueAnalitico[]> => {
  const resp = await api.get(`${base}/estoque`);
  return resp.data.data || [];
};
