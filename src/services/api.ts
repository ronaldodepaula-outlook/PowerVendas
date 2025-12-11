import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

// attach token when present in localStorage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
api.interceptors.request.use((config: any) => {
	const token = localStorage.getItem('empresa_token');
	if (token) {
		if (!config.headers) config.headers = {};
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
