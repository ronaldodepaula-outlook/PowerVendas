import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RecuperarSenhaSolicitar: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await api.post('/auth/recuperar-senha/solicitar', { email, tipo_usuario: 'EMPRESA' });
      setMessage('Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha. Verifique sua caixa de entrada.');
    } catch (err: unknown) {
      console.error('Erro solicitar recuperar senha', err);
      const getErrorMessage = (e: unknown, fallback = 'Erro ao solicitar recuperação de senha') => {
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
          <h2 className="text-2xl font-bold mb-2">Recuperar senha</h2>
          <p className="text-sm text-gray-600 mb-4">Informe o e-mail cadastrado para receber o link de recuperação.</p>

          {message && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">{message}</div>}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="seu@email.com"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? 'Enviando...' : 'Enviar link'}</button>
              <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded">Voltar</button>
            </div>
          </form>
        </div>
        <div className="text-center mt-6 text-gray-600 text-sm">© 2025 Baterias SaaS</div>
      </div>
    </div>
  );
};

export default RecuperarSenhaSolicitar;
