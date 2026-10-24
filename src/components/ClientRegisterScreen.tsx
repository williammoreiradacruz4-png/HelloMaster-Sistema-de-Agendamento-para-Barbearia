import React, { useState } from 'react';
import { User, Phone, MapPin, Search, ArrowLeft, CheckCircle2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { ClientRecord } from '../types/barber';

interface ClientRegisterScreenProps {
  tenantId?: string;
  onSuccess: (newClient: ClientRecord) => void;
  onBackToLogin: () => void;
}

export const ClientRegisterScreen: React.FC<ClientRegisterScreenProps> = ({
  tenantId,
  onSuccess,
  onBackToLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState('');
  const [bairro, setBairro] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone mask helper
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  // CEP search helper (simulated with real fallback lookup)
  const handleCepSearch = () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length < 8) {
      setError('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }

    setIsSearchingCep(true);
    setError(null);

    // Try ViaCEP public API with fallback
    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.erro) {
          setAddress(data.logradouro || '');
          setBairro(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || 'SP');
        } else {
          // Fallback simulation
          setAddress('Rua Principal');
          setBairro('Centro');
          setCity('São Paulo');
          setState('SP');
        }
      })
      .catch(() => {
        // Fallback simulation
        setAddress('Av. das Nações');
        setBairro('Jardins');
        setCity('São Paulo');
        setState('SP');
      })
      .finally(() => {
        setIsSearchingCep(false);
      });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      alert("Nome e Contato são obrigatórios.");
      setError("Nome e Contato são obrigatórios.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '') || phone.trim();
    const loginEmail = `${cleanPhone}@barber.com`;
    const formattedAddress = `${address}, ${bairro}, ${city}-${state} (CEP: ${cep})`;

    // Corrigido: O cliente agora inicia estritamente com ZERO (0) pontos
    const newCustomer: ClientRecord = {
      id: "cst-" + Date.now(),
      tenantId: tenantId || 'shop-1',
      name: name.trim(),
      phone: phone.trim(),
      email: loginEmail,
      cep: cep.trim(),
      address: formattedAddress,
      bairro: bairro.trim(),
      city: city.trim(),
      state: state.trim(),
      loyaltyPoints: 0, // Corrigido: O cliente agora inicia estritamente com ZERO (0) pontos
      totalVisits: 0,
      totalSpent: 0,
      notes: `Endereço: ${formattedAddress}`,
    };

    onSuccess(newCustomer);
    alert(`Cadastro efetuado com sucesso!\nFaça login utilizando o e-mail: ${cleanPhone}@barber.com`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 sm:p-6 text-neutral-100 relative selection:bg-amber-500 selection:text-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.1)_0%,transparent_60%)] pointer-events-none" />

      <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-xl my-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-display text-white">Cadastro de Cliente</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Crie sua conta para agendar e gerenciar seus horários
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Nome Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="reg-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Contato / WhatsApp *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="reg-phone"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                CEP (com busca automática)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="reg-cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleCepSearch}
                  disabled={isSearchingCep}
                  className="px-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isSearchingCep ? '...' : 'Buscar'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                E-mail (opcional para login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Endereço Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="reg-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - Apto 32"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Bairro
              </label>
              <input
                type="text"
                id="reg-bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bela Vista"
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Cidade
              </label>
              <input
                type="text"
                id="reg-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Estado (UF)
              </label>
              <input
                type="text"
                id="reg-state"
                value={state}
                maxLength={2}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="SP"
                className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 uppercase font-mono"
              />
            </div>
          </div>

          {/* Login credential preview banner */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Login de acesso após o cadastro: <strong className="text-amber-400 font-mono">{phone.replace(/\D/g, '') || 'contato'}@barber.com</strong>
            </span>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalizar Cadastro</span>
            </button>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
