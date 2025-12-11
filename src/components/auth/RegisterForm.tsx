import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/auth.service';
import { CheckCircle, AlertCircle } from 'lucide-react';

type Step = 'empresa' | 'usuario' | 'confirmacao';

interface ErrorResponse {
  response?: { data?: { message?: string } };
  message?: string;
}

interface EmpresaData {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  email: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  cidade: string;
  estado: string;
}

interface UsuarioData {
  nome: string;
  email: string;
  senha: string;
  senha_confirmation: string;
}

export const RegisterForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('empresa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const [empresaData, setEmpresaData] = useState<EmpresaData>({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    email: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    cidade: '',
    estado: '',
  });

  const [usuarioData, setUsuarioData] = useState<UsuarioData>({
    nome: '',
    email: '',
    senha: '',
    senha_confirmation: '',
  });

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmpresaData(prev => ({ ...prev, [name]: value }));
  };

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsuarioData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmpresa = (): boolean => {
    const required = ['nome_fantasia', 'razao_social', 'cnpj', 'email', 'telefone', 'cep', 'endereco', 'numero', 'cidade', 'estado'];
    for (const field of required) {
      if (!empresaData[field as keyof EmpresaData]) {
        setError(`Campo ${field} é obrigatório`);
        return false;
      }
    }
    // Validação básica de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empresaData.email)) {
      setError('Email inválido');
      return false;
    }
    // Validação básica de CEP
    if (!/^\d{5}-?\d{3}$/.test(empresaData.cep)) {
      setError('CEP inválido (formato: XXXXX-XXX)');
      return false;
    }
    setError(null);
    return true;
  };

  const validateUsuario = (): boolean => {
    if (!usuarioData.nome || !usuarioData.email || !usuarioData.senha) {
      setError('Todos os campos são obrigatórios');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuarioData.email)) {
      setError('Email do usuário inválido');
      return false;
    }
    if (usuarioData.senha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (usuarioData.senha !== usuarioData.senha_confirmation) {
      setError('Senhas não correspondem');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 'empresa') {
      if (validateEmpresa()) {
        setCurrentStep('usuario');
      }
    } else if (currentStep === 'usuario') {
      if (validateUsuario()) {
        setCurrentStep('confirmacao');
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'usuario') {
      setCurrentStep('empresa');
    } else if (currentStep === 'confirmacao') {
      setCurrentStep('usuario');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.registerEmpresa(
        empresaData as unknown as Record<string, unknown>,
        usuarioData as unknown as Record<string, unknown>
      );
      setSuccessMessage('Empresa criada com sucesso! Redirecionando...');
      
      // Auto-login com as credenciais fornecidas
      setTimeout(async () => {
        try {
          await auth.login(usuarioData.email, usuarioData.senha);
          navigate('/', { replace: true });
        } catch (loginErr: unknown) {
          const apiErr = loginErr as ErrorResponse;
          console.error('Erro ao fazer login automático:', apiErr);
          setError('Conta criada, mas erro ao fazer login. Por favor, faça login manualmente.');
          setTimeout(() => navigate('/login'), 3000);
        }
      }, 2000);
    } catch (err: unknown) {
      const apiErr = err as ErrorResponse;
      console.error('Erro ao registrar:', apiErr);
      const errorMessage = apiErr?.response?.data?.message || apiErr?.message || 'Erro ao registrar empresa';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = currentStep === 'empresa' ? 33 : currentStep === 'usuario' ? 66 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">⚡ Baterias SaaS</h1>
          <p className="text-gray-600">Cadastro de Empresa</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Step Indicators */}
          <div className="px-8 pt-8">
            <div className="flex justify-between items-center mb-8">
              <div className={`flex flex-col items-center ${currentStep === 'empresa' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${currentStep === 'empresa' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <span className="text-xs font-medium">Empresa</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep !== 'empresa' ? 'bg-gray-300' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${currentStep === 'usuario' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${currentStep === 'usuario' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <span className="text-xs font-medium">Usuário</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${currentStep === 'confirmacao' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex flex-col items-center ${currentStep === 'confirmacao' ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${currentStep === 'confirmacao' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
                <span className="text-xs font-medium">Confirmação</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-8 mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mx-8 mb-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="px-8 py-6">
            {/* STEP 1: EMPRESA */}
            {currentStep === 'empresa' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados da Empresa</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia *</label>
                    <input
                      type="text"
                      name="nome_fantasia"
                      value={empresaData.nome_fantasia}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Baterias Fortaleza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
                    <input
                      type="text"
                      name="razao_social"
                      value={empresaData.razao_social}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Baterias Fortaleza LTDA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ *</label>
                    <input
                      type="text"
                      name="cnpj"
                      value={empresaData.cnpj}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 00.000.000/0000-01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato *</label>
                    <input
                      type="email"
                      name="email"
                      value={empresaData.email}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: contato@empresa.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                    <input
                      type="tel"
                      name="telefone"
                      value={empresaData.telefone}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 85988880000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                    <input
                      type="text"
                      name="cep"
                      value={empresaData.cep}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 60123-456"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
                    <input
                      type="text"
                      name="endereco"
                      value={empresaData.endereco}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Rua das Flores"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                    <input
                      type="text"
                      name="numero"
                      value={empresaData.numero}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 120"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                    <input
                      type="text"
                      name="cidade"
                      value={empresaData.cidade}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Fortaleza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                    <select
                      name="estado"
                      value={empresaData.estado}
                      onChange={handleEmpresaChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: USUARIO */}
            {currentStep === 'usuario' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados do Administrador</h2>
                <p className="text-gray-600 mb-6">Crie a conta do administrador da empresa</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="nome"
                    value={usuarioData.nome}
                    onChange={handleUsuarioChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: João Administrador"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={usuarioData.email}
                    onChange={handleUsuarioChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: joao@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                  <input
                    type="password"
                    name="senha"
                    value={usuarioData.senha}
                    onChange={handleUsuarioChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
                  <input
                    type="password"
                    name="senha_confirmation"
                    value={usuarioData.senha_confirmation}
                    onChange={handleUsuarioChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMACAO */}
            {currentStep === 'confirmacao' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirme seus Dados</h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nome Fantasia</p>
                        <p className="font-semibold text-gray-900">{empresaData.nome_fantasia}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Razão Social</p>
                        <p className="font-semibold text-gray-900">{empresaData.razao_social}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CNPJ</p>
                        <p className="font-semibold text-gray-900">{empresaData.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">{empresaData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Telefone</p>
                        <p className="font-semibold text-gray-900">{empresaData.telefone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cidade/Estado</p>
                        <p className="font-semibold text-gray-900">{empresaData.cidade}, {empresaData.estado}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Administrador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nome</p>
                        <p className="font-semibold text-gray-900">{usuarioData.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">{usuarioData.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    ✓ Ao confirmar, você concorda com nossos termos de serviço e política de privacidade.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Buttons */}
          <div className="px-8 py-6 bg-gray-50 border-t flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 'empresa' || loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Voltar
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Já tem conta? Faça login
              </button>
              
              {currentStep !== 'confirmacao' ? (
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Próximo →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Criando conta...' : 'Criar Empresa'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>© 2025 Baterias SaaS. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
