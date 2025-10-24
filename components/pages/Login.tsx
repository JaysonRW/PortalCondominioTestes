import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          whatsapp,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else if (data.session) {
        setMessage('Cadastro realizado com sucesso! Você já está logado.');
    } else {
      setMessage('Cadastro realizado! Por favor, verifique seu e-mail para confirmação (se habilitado).');
      setIsLoginView(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-center text-3xl font-bold text-accent">
            {isLoginView ? 'Acessar Portal' : 'Criar Conta'}
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            {isLoginView ? 'Bem-vindo(a) de volta!' : 'Junte-se à nossa comunidade.'}
          </p>
        </div>

        {error && <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-center p-3 rounded-md">{error}</div>}
        {message && <div className="bg-green-500/20 text-green-400 border border-green-500/30 text-center p-3 rounded-md">{message}</div>}

        <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
          {!isLoginView && (
            <>
              <div>
                <label className="text-sm font-bold text-white/80 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-white/80 block mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  placeholder="(XX) XXXXX-XXXX"
                  className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-bold text-white/80 block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-white/80 block mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/10 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-primary font-bold py-3 rounded-md hover:bg-accent/80 transition-colors disabled:bg-accent/50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : (isLoginView ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <p className="text-center text-sm">
          <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-accent/80 hover:text-accent transition-colors">
            {isLoginView ? 'Não tem uma conta? Crie uma agora!' : 'Já tem uma conta? Entre aqui.'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
