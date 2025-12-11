import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Truck,
  Zap,
  DollarSign,
  Package,
  AlertCircle,
} from 'lucide-react';
import {
  getDashboard,
  getVendasMensal,
  getTopProdutos,
  getEstoqueAnalitico,
  type DashboardData,
  type VendaMensal,
  type TopProduto,
  type EstoqueAnalitico,
} from '../services/bi.service';

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [vendasMensal, setVendasMensal] = useState<VendaMensal[]>([]);
  const [vendasError, setVendasError] = useState<string | null>(null);
  const [topProdutos, setTopProdutos] = useState<TopProduto[]>([]);
  const [estoque, setEstoque] = useState<EstoqueAnalitico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // use allSettled so one failing endpoint doesn't block others
        const results = await Promise.allSettled([
          getDashboard(),
          getVendasMensal(),
          getTopProdutos(),
          getEstoqueAnalitico(),
        ]);

        const [rDashboard, rVendas, rTop, rEstoque] = results;

        if (rDashboard.status === 'fulfilled') setDashboardData(rDashboard.value);
        else console.warn('Dashboard data failed:', rDashboard);

        if (rVendas.status === 'fulfilled') {
          setVendasMensal(rVendas.value);
          setVendasError(null);
        } else {
          console.warn('Vendas mensais failed:', rVendas);
          const reason = (rVendas as PromiseRejectedResult).reason;
          const msg = reason?.response?.data?.message ?? reason?.message ?? 'Falha ao carregar vendas mensais';
          setVendasError(String(msg));
          setVendasMensal([]);
        }

        if (rTop.status === 'fulfilled') setTopProdutos(rTop.value);
        else console.warn('Top produtos failed:', rTop);

        if (rEstoque.status === 'fulfilled') setEstoque(rEstoque.value);
        else console.warn('Estoque analitico failed:', rEstoque);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">{error || 'Erro ao carregar dados'}</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total de Clientes',
      value: dashboardData.total_clientes,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total de Veículos',
      value: dashboardData.total_veiculos,
      icon: Truck,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Atendimentos',
      value: dashboardData.total_atendimentos,
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Itens em Estoque',
      value: parseInt(String(dashboardData.total_itens_estoque)).toLocaleString('pt-BR'),
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const financeiro = [
    {
      label: 'Valor Recebido',
      value: `R$ ${Number(dashboardData.valor_total_recebido).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Valor Pendente',
      value: `R$ ${Number(dashboardData.valor_total_pendente).toFixed(2)}`,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Contas a Pagar (Pago)',
      value: `R$ ${Number(dashboardData.valor_contas_pagar_pago).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Contas a Pagar (Pendente)',
      value: `R$ ${Number(dashboardData.valor_contas_pagar_pendente).toFixed(2)}`,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{dashboardData.nome_fantasia}</h1>
        <p className="text-gray-600">{dashboardData.razao_social}</p>
        <p className="text-xs text-gray-500 mt-1">Atualizado em: {new Date(dashboardData.data_consulta).toLocaleString('pt-BR')}</p>
      </div>

      {/* KPIs Principais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Indicadores Principais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className={`${kpi.bgColor} border border-gray-200 rounded-lg p-6 hover:shadow-lg transition`}>
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${kpi.color} text-white mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financeiro */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Posição Financeira
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financeiro.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`${item.bgColor} border border-gray-200 rounded-lg p-6 hover:shadow-lg transition`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendas Mensais e Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas Mensal */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas Mensais</h3>
          {vendasMensal.length > 0 ? (
            <div className="space-y-4">
              {vendasMensal.map((venda, idx) => {
                const altura = (Number(venda.total_vendas) / 2000) * 200;
                return (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{venda.mes}</span>
                      <span className="text-sm font-bold text-green-600">R$ {Number(venda.total_vendas).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((altura / 200) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Sem dados de vendas</p>
              {vendasError && (
                <p className="text-sm text-yellow-700 mt-2">Aviso: {vendasError}</p>
              )}
            </div>
          )}
        </div>

        {/* Top Produtos */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Produtos Vendidos</h3>
          {topProdutos.length > 0 ? (
            <div className="space-y-4">
              {topProdutos.map((produto, idx) => (
                <div key={idx} className="flex items-between justify-between py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{produto.modelo}</p>
                    <p className="text-xs text-gray-500">{produto.amperagem}Ah</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{produto.total_vendido} un.</p>
                    <p className="text-sm text-green-600">R$ {Number(produto.faturamento).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem dados de vendas</p>
          )}
        </div>
      </div>

      {/* Análise de Estoque */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Análise de Estoque
        </h3>
        {estoque.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Produto</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Qtd</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor Custo</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor Venda</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Giro 3m</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Cobertura (dias)</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Markup</th>
                </tr>
              </thead>
              <tbody>
                {estoque.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.modelo}</p>
                        <p className="text-xs text-gray-500">{item.codigo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">{item.quantidade_atual}</td>
                    <td className="px-4 py-3 text-right text-gray-900">R$ {Number(item.valor_estoque_custo).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">R$ {Number(item.valor_estoque_venda).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {item.giro_3_meses ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          Number(item.giro_3_meses) > 0.1
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {Number(item.giro_3_meses).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {item.cobertura_dias ? `${item.cobertura_dias} dias` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-blue-600">
                      {Number(item.markup).toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Sem dados de estoque</p>
        )}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center py-4 border-t">
        Dashboard atualizado em: {new Date(dashboardData.data_consulta).toLocaleString('pt-BR')}
      </div>
    </div>
  );
};
