import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const scorePassword = (p: string) => {
  let score = 0;
  if (p.length >= 8) score += 1;
  if (/[A-Z]/.test(p)) score += 1;
  if (/[0-9]/.test(p)) score += 1;
  if (/[^A-Za-z0-9]/.test(p)) score += 1;
  return score; // 0-4
};

const strengthLabel = (s: number) => {
  if (s <= 1) return 'Fraca';
  if (s === 2) return 'Média';
  if (s === 3) return 'Forte';
  return 'Muito forte';
};

const RecuperarSenhaConfirmar: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const tipo = params.get('tipo') ?? 'EMPRESA';
  const navigate = useNavigate();

  const [valid, setValid] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const validate = async () => {
      if (!token) return setValid(false);
      setLoading(true);
      try {
        const resp = await api.post('/auth/recuperar-senha/validar-token', { token, tipo_usuario: tipo });
        setValid(resp.data?.valid === true);
        setEmail(resp.data?.email ?? null);
      } catch (err: unknown) {
        console.error('Erro validar token', err);
        setValid(false);
      } finally {
        setLoading(false);
      }
    };
    void validate();
  }, [token, tipo]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== passwordConfirm) return setError('As senhas não coincidem');
    const score = scorePassword(password);
    if (score < 2) return setError('A senha é muito fraca');
    setLoading(true);
    try {
      const resp = await api.post('/auth/recuperar-senha/resetar', {
        token,
        tipo_usuario: tipo,
        nova_senha: password,
        nova_senha_confirmation: passwordConfirm,
      });
      setSuccess(resp.data?.message || 'Senha alterada com sucesso.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: unknown) {
      console.error('Erro resetar senha', err);
      const getErrorMessage = (e: unknown, fallback = 'Erro ao redefinir senha') => {
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

  const score = scorePassword(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-2">Redefinir senha</h2>
          {loading && <p className="text-sm text-gray-500">Validando...</p>}
          {valid === false && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">Token inválido ou expirado.</div>
          )}
          {valid === true && (
            <>
              <p className="text-sm text-gray-600 mb-3">E-mail: <strong>{email}</strong></p>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{error}</div>}
              {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-3">{success}</div>}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
                  <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className="w-full px-4 py-2 border rounded" required />
                </div>

                <div>
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div className={`h-full ${score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-yellow-400' : score === 3 ? 'bg-green-400' : 'bg-green-600'}`} style={{ width: `${(score/4)*100}%`}} />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Força: {strengthLabel(score)}</div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? 'Enviando...' : 'Redefinir senha'}</button>
                  <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded">Cancelar</button>
                </div>
              </form>
            </>
          )}
        </div>
        <div className="text-center mt-6 text-gray-600 text-sm">© 2025 Baterias SaaS</div>
      </div>
    </div>
  );
};

export default RecuperarSenhaConfirmar;
