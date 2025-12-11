import React, { createContext, useEffect, useState } from 'react';
import authService from '../services/auth.service';

export interface User {
	id?: number;
	nome?: string;
	email?: string;
}

export interface AuthContextType {
	user: User | null;
	token: string | null;
	login: (email: string, senha: string) => Promise<void>;
	logout: () => Promise<void> | void;
	registerEmpresa: (empresa: Record<string, unknown>, usuario: Record<string, unknown>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(() => localStorage.getItem('empresa_token'));

	useEffect(() => {
		const load = async () => {
			if (token) {
				try {
					const res = await authService.me();
					setUser(res || null);
				} catch (err) {
					console.warn('me failed', err);
					setUser(null);
					setToken(null);
					localStorage.removeItem('empresa_token');
				}
			}
		};
		void load();
	}, [token]);

	const login = async (email: string, senha: string) => {
		const response = await authService.login(email, senha);
		console.log('Login response:', response);
		
		// Extrai o token da resposta: { token, usuario }
		const tokenValue = response?.token;
		if (!tokenValue) throw new Error('Token not returned from login');
		
		// Extrai dados do usuário da resposta
		const userData = response?.usuario;
		
		localStorage.setItem('empresa_token', String(tokenValue));
		setToken(String(tokenValue));
		
		// Se há dados de usuário na resposta de login, usa eles
		if (userData) {
			setUser(userData);
		} else {
			// Caso contrário, chama o endpoint /auth/me
			try {
				const me = await authService.me();
				setUser(me || null);
			} catch (err) {
				console.warn('Failed to fetch user data:', err);
				setUser(null);
			}
		}
	};

	const logout = async () => {
		try {
			await authService.logout();
		} catch {
			// ignore error on logout
		}
		localStorage.removeItem('empresa_token');
		setToken(null);
		setUser(null);
	};

	const registerEmpresa = async (empresa: Record<string, unknown>, usuario: Record<string, unknown>) => {
		await authService.registerEmpresa(empresa, usuario);
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout, registerEmpresa }}>
			{children}
		</AuthContext.Provider>
	);
};

// do not default-export to keep file export limited to components/hooks
