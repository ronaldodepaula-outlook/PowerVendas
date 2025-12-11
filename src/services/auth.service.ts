import api from './api';

export const authService = {
	login: async (email: string, senha: string) => {
		const res = await api.post('/auth/login', { email, senha });
		// Retorna a resposta completa: { token, usuario }
		return res.data;
	},
	logout: async () => {
		const res = await api.post('/auth/logout');
		return res.data;
	},
	me: async () => {
		const res = await api.get('/auth/me');
		// Retorna dados do usuário
		return res.data;
	},
	registerEmpresa: async (empresa: Record<string, unknown>, usuario: Record<string, unknown>) => {
		const res = await api.post('/auth/register-empresa', { empresa, usuario });
		return res.data;
	},
};

export default authService;
