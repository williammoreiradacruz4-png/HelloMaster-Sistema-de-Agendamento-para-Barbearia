import React, { useState } from 'react';
import { ShieldCheck, Store, User, Lock, Mail, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { UserRole } from '../types/barber';
import logoHelloMaster from '../assets/hellomaster.png';

interface LoginScreenProps {
  onLogin: (email: string, role: UserRole, tenantId?: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToClientPortal: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onNavigateToRegister,
  onNavigateToClientPortal,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Matching logic
    if (cleanEmail === 'admin@master.com' || cleanEmail === 'admin@barbersaas.com') {
      onLogin(cleanEmail, 'master');
    } else if (
      cleanEmail === 'barber@test.com' ||
      cleanEmail === 'navalha@barbersaas.com' ||
      cleanEmail === 'contato@vintageclub.com' ||
      cleanEmail === 'vintage-club@barber.com' ||
      cleanEmail.includes('adm@')
    ) {
      onLogin(cleanEmail, 'tenant', 'shop-1');
    } else {
      // Default to client login (e.g. phone@barber.com, carlos@email.com, etc.)
      onLogin(cleanEmail, 'client', 'shop-1');
    }
  };

  const handleQuickLogin = (role: UserRole, demoEmail: string, demoTenantId?: string) => {
    setEmail(demoEmail);
    setPassword('••••••••');
    setError(null);
    setTimeout(() => {
      onLogin(demoEmail, role, demoTenantId);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 text-neutral-100 relative selection:bg-amber-500 selection:text-neutral-950">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.12)_0%,transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header brand */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="max-w-[200px] mb-2">
            <img src={logoHelloMaster} alt="HelloMaster" className="w-full h-auto object-contain drop-shadow-md" />
          </div>
          <p className="text-xs text-neutral-400">
            Plataforma Multi-Tenant para Barbearias
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-white">Acessar o Sistema</h2>
              <p className="text-xs text-neutral-400">Entre com as suas credenciais</p>
            </div>
            <span className="text-[11px] font-mono bg-neutral-800 text-amber-400 border border-neutral-700 px-2 py-0.5 rounded">
              v2.4 Live
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="login-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-neutral-950 font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Não tem conta de cliente?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
            >
              Cadastre-se aqui
            </button>
          </div>

          {/* Direct Client Portal Link */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onNavigateToClientPortal}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer py-1"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Quero apenas agendar um corte online</span>
            </button>
          </div>
        </div>

        {/* Demo Fast Switcher Box */}
        <div className="mt-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 text-xs text-neutral-400">
          <p className="font-semibold text-neutral-200 mb-2.5 flex items-center gap-1.5">
            <span>⚡ Acesso Rápido para Demonstração:</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('master', 'admin@master.com')}
              className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-indigo-600/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-indigo-400 group-hover:text-indigo-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Master</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">admin@master.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tenant', 'barber@test.com', 'shop-1')}
              className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-600/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-amber-400 group-hover:text-amber-300">
                <Store className="w-3.5 h-3.5" />
                <span>Barbearia Admin</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">barber@test.com</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('client', 'carlos@email.com', 'shop-1')}
              className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-emerald-600/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 group-hover:text-emerald-300">
                <User className="w-3.5 h-3.5" />
                <span>Cliente App</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">carlos@email.com</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
