import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
	const [email, setEmail] = useState('joao@bateriasfortaleza.com');
	const [senha, setSenha] = useState('123456');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const auth = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			console.log('Iniciando login...');
			await auth.login(email, senha);
			console.log('Login bem-sucedido, redirecionando...');
			navigate('/', { replace: true });
		} catch (err: unknown) {
			console.error('Erro de login:', err);
			const getErrorMessage = (e: unknown, fallback = 'Erro ao logar') => {
				if (!e) return fallback;
				if (typeof e === 'string') return e;
				if (typeof e === 'object') {
					const obj = e as Record<string, unknown>;
					if ('response' in obj && obj.response && typeof obj.response === 'object') {
						const resp = obj.response as Record<string, unknown>;
						if ('data' in resp && resp.data && typeof resp.data === 'object') {
							const data = resp.data as Record<string, unknown>;
							if ('message' in data) return String(data.message ?? fallback);
						}
					}
					if ('message' in obj) return String((obj as Record<string, unknown>).message ?? fallback);
				}
				return fallback;
			};
			setError(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-xl p-8">
					<h1 className="text-4xl font-bold text-center mb-2">⚡ PowerVendas</h1>
					<p className="text-center text-gray-600 mb-8">Faça login com suas credenciais</p>
					
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
							<AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4 mb-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
							<input
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="seu@email.com"
								type="email"
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
							<input
								value={senha}
								onChange={(e) => setSenha(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Sua senha"
								type="password"
								required
							/>
						</div>
						<button 
							disabled={loading}
							type="submit"
							className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition"
						>
							{loading ? 'Entrando...' : 'Entrar'}
						</button>
					</form>

					{/* Separador */}
					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">ou</span>
						</div>
					</div>

					{/* Cadastro */}
					<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
						<p className="text-sm text-gray-700 mb-3">
							<span className="font-semibold text-indigo-600">👤 Ainda não se cadastrou?</span>
							<br />
							Crie sua conta agora e comece a usar o Baterias SaaS
						</p>
						<button
							type="button"
							onClick={() => navigate('/register')}
							className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition"
						>
							Criar nova conta
						</button>
					</div>

					<div className="text-center">
										<button onClick={() => navigate('/recuperar-senha')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
											Esqueceu sua senha?
										</button>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8 text-gray-600 text-sm">
					<p>© 2025 Baterias SaaS. Todos os direitos reservados.</p>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
