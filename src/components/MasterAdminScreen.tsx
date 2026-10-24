import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
  Key,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Power,
  Store,
  LogOut,
  Search,
  Sparkles,
  DollarSign,
  QrCode,
  X,
  Printer,
  Trash2,
  AlertTriangle,
  Crown,
  Pencil
} from 'lucide-react';
import { BarberTenant } from '../types/barber';
import { QRCodeCanvas } from './QRCodeCanvas';
import logoHelloMaster from '../assets/hellomaster.png';

interface MasterAdminScreenProps {
  tenants: BarberTenant[];
  onAddTenant: (newTenant: BarberTenant, tempPass: string) => void;
  onToggleStatus: (tenantId: string) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onUpdateTenant?: (updatedTenant: BarberTenant) => void;
  onImpersonateTenant: (tenantId: string) => void;
  onTestClientLink?: (slug: string) => void;
  onResetDatabase?: () => void;
  onLogout: () => void;
}

export const MasterAdminScreen: React.FC<MasterAdminScreenProps> = ({
  tenants,
  onAddTenant,
  onToggleStatus,
  onDeleteTenant,
  onUpdateTenant,
  onImpersonateTenant,
  onTestClientLink,
  onResetDatabase,
  onLogout,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Pro' | 'Enterprise' | 'Vitalício'>('Pro');
  const [search, setSearch] = useState('');
  const [selectedQrTenant, setSelectedQrTenant] = useState<BarberTenant | null>(null);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<BarberTenant | null>(null);
  const [tenantToEdit, setTenantToEdit] = useState<BarberTenant | null>(null);
  const [editForm, setEditForm] = useState<BarberTenant | null>(null);

  // Temp credential modal
  const [createdTenantData, setCreatedTenantData] = useState<{
    tenant: BarberTenant;
    tempPass: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

    if (!name.trim() || !sanitizedSlug) {
      alert("Preencha o Nome e o Subdomínio/Slug identificador da Barbearia.");
      return;
    }

    if (tenants.some((shop) => shop.slug === sanitizedSlug)) {
      alert("Este identificador/subdomínio já está em uso por outro inquilino.");
      return;
    }

    const tempPassword = Math.random().toString(36).substring(2, 7);
    const shopEmail = `${sanitizedSlug}@barber.com`;

    const newTenant: BarberTenant = {
      id: "shop-" + Date.now(),
      name: name.trim(),
      slug: sanitizedSlug,
      email: shopEmail,
      phone: phone.trim() || '(11) 98000-0000',
      status: 'ativa',
      plan,
      createdAt: new Date().toISOString().split('T')[0],
      monthlyRevenue: plan === 'Starter' ? 79 : plan === 'Pro' ? 149 : plan === 'Enterprise' ? 249 : 0,
      totalAppointments: 0,
      themeColor: 'amber',
      slogan: 'Excelência em cada detalhe',
      address: 'Endereço Principal, 100',
      bairro: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      openingHours: 'Segunda a Sábado, das 09:00 às 20:00',
      logoLetter: name.trim().charAt(0).toUpperCase() || 'B',
    };

    onAddTenant(newTenant, tempPassword);
    setCreatedTenantData({ tenant: newTenant, tempPass: tempPassword });

    // Limpa campos
    setName('');
    setSlug('');
    setEmail('');
    setPhone('');

    alert(`Barbearia cadastrada com sucesso!\nLogin do Dono: ${shopEmail}\nSenha Temporária: ${tempPassword}\nPlano: ${plan}`);
  };

  const copyCredentials = () => {
    if (!createdTenantData) return;
    const text = `💈 Acesso ao BarberSaaS:
Barbearia: ${createdTenantData.tenant.name}
Painel: https://barbersaas.com/${createdTenantData.tenant.slug}
E-mail: ${createdTenantData.tenant.email}
Senha Provisória: ${createdTenantData.tempPass}
Plano: ${createdTenantData.tenant.plan}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    const trimmedName = editForm.name.trim();
    const sanitizedSlug = editForm.slug.trim().toLowerCase().replace(/\s+/g, '-');

    if (!trimmedName || !sanitizedSlug) {
      alert('Nome da barbearia e Subdomínio/Slug são obrigatórios.');
      return;
    }

    if (
      tenants.some(
        (t) => t.id !== editForm.id && t.slug.toLowerCase() === sanitizedSlug
      )
    ) {
      alert('Este identificador (slug) já está em uso por outro inquilino.');
      return;
    }

    const updated: BarberTenant = {
      ...editForm,
      name: trimmedName,
      slug: sanitizedSlug,
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      monthlyRevenue:
        editForm.plan === 'Starter'
          ? 79
          : editForm.plan === 'Pro'
          ? 149
          : editForm.plan === 'Enterprise'
          ? 249
          : 0,
      logoLetter: trimmedName.charAt(0).toUpperCase() || 'B',
    };

    if (onUpdateTenant) {
      onUpdateTenant(updated);
    }

    setTenantToEdit(null);
    setEditForm(null);
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const totalMRR = tenants.reduce((acc, t) => {
    const fee = t.plan === 'Starter' ? 79 : t.plan === 'Pro' ? 149 : t.plan === 'Enterprise' ? 249 : 0;
    return acc + fee;
  }, 0);

  const lifetimeTenants = tenants.filter((t) => t.plan === 'Vitalício');
  const totalLifetimeRevenue = lifetimeTenants.length * 1499;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 2) HEADER DA 3ª TELA (ADMIN MASTER) COM A LOGO OFICIAL */}
      <header className="bg-neutral-950 border-b border-neutral-800 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <img src={logoHelloMaster} alt="HelloMaster" className="h-10 w-auto object-contain" />
          <div>
            <span className="text-lg font-bold tracking-wide">
              Painel <span className="text-amber-500">Master</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Firestore Sync Ativo (Multi-Dispositivo)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onResetDatabase && (
            <button
              onClick={() => {
                if (window.confirm("Atenção: Deseja realmente zerar todos os dados fictícios do sistema (barbearias, serviços, agendamentos, etc.) no Firestore e restaurar o estado limpo?")) {
                  onResetDatabase();
                }
              }}
              title="Zerar todos os dados de teste e começar do zero"
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 border border-neutral-800 hover:border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar Dados Fictícios</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
          >
            Sair do Sistema
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Barbearias Cadastradas</span>
              <Store className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {tenants.length}
            </div>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <span>● {tenants.filter((t) => t.status === 'ativa').length} ativas na rede</span>
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">MRR da Plataforma</span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              R$ {totalMRR.toLocaleString('pt-BR')},00
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Receita Recorrente Mensal
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Planos Vitalícios</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400">
              {lifetimeTenants.length} <span className="text-sm font-normal text-neutral-400">({totalLifetimeRevenue > 0 ? `R$ ${totalLifetimeRevenue.toLocaleString('pt-BR')}` : 'R$ 0'})</span>
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Compras Definitivas do App
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Agendamentos Totais</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {tenants.reduce((acc, t) => acc + t.totalAppointments, 0)}
            </div>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Processados via BarberSaaS
            </span>
          </div>
        </div>

        {/* Cadastrar Nova Barbearia Inquilina */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Cadastrar Nova Barbearia Inquilina</h2>
                <p className="text-xs text-neutral-400">Crie o tenant e gere as credenciais imediatas</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Nome da Barbearia *
                </label>
                <input
                  type="text"
                  id="master-barber-name"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Barbearia Don Corleone"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Identificador Único (Slug) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-mono text-neutral-500">
                    barbersaas.com/
                  </span>
                  <input
                    type="text"
                    id="master-barber-slug"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="don-corleone"
                    className="w-full pl-36 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  E-mail do Proprietário
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@barbearia.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Contato / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Plano do SaaS
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                >
                  <option value="Starter">Starter (R$ 79/mês - 1 a 2 barbeiros)</option>
                  <option value="Pro">Pro (R$ 149/mês - Até 6 barbeiros + Fidelidade)</option>
                  <option value="Enterprise">Enterprise (R$ 249/mês - Ilimitado + Multi-unidade)</option>
                  <option value="Vitalício">👑 Vitalício (R$ 1.499,00 - Compra Definitiva do App / Sem Mensalidades)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-950 flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Gerar Acesso e Senha Temporária</span>
            </button>
          </form>
        </section>

        {/* Modal / Card de Credenciais Geradas */}
        {createdTenantData && (
          <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-2xl p-5 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Check className="w-4 h-4" />
                  <span>Nova Barbearia Provisionada com Sucesso!</span>
                </div>
                <p className="text-xs text-neutral-300 mt-1">
                  Barbearia: <strong>{createdTenantData.tenant.name}</strong> ({createdTenantData.tenant.plan === 'Vitalício' ? '👑 Licença Vitalícia' : `Plano ${createdTenantData.tenant.plan}`})
                </p>
                <div className="mt-2 text-xs font-mono text-neutral-300 bg-neutral-900/90 p-3 rounded-lg border border-neutral-800 space-y-1">
                  <div>E-mail de Acesso: <span className="text-emerald-300 font-bold">{createdTenantData.tenant.email}</span></div>
                  <div>Senha Temporária: <span className="text-amber-400 font-bold">{createdTenantData.tempPass}</span></div>
                  <div>Slug / URL: <span className="text-indigo-300">barbersaas.com/{createdTenantData.tenant.slug}</span></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={copyCredentials}
                  className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Acesso'}</span>
                </button>
                <button
                  onClick={() => onImpersonateTenant(createdTenantData.tenant.id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Acessar Painel Desta Barbearia</span>
                </button>
                <button
                  onClick={() => setCreatedTenantData(null)}
                  className="px-2.5 py-2 rounded-xl text-neutral-400 hover:text-neutral-200 text-xs transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Barbearias Ativas e Acessos */}
        <div className="bg-white p-6 rounded-xl shadow text-gray-900">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-gray-200 gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-gray-900 mb-0">Barbearias Ativas e Acessos</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-semibold">
                {tenants.length} cadastradas
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou slug..."
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600">
                  <th className="p-3">Nome & Plano</th>
                  <th className="p-3">Acesso Administrativo (Login)</th>
                  <th className="p-3 text-center">QR Code do Cliente (Subdomínio)</th>
                </tr>
              </thead>
              <tbody id="master-barber-list" className="divide-y divide-gray-200 text-xs text-gray-800">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      Nenhuma barbearia encontrada para os filtros.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((shop) => {
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
                    const clientTargetUrl = `${baseUrl}?barber=${shop.slug}`;

                    return (
                      <tr key={shop.id} className="border-b text-sm align-middle hover:bg-gray-50/80 transition-colors">
                        {/* 1. Nome & Plano */}
                        <td className="p-3 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                              {shop.logoLetter || shop.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-sm block">{shop.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {shop.plan === 'Vitalício' ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1 shadow-xs">
                                    <Crown className="w-3 h-3 text-amber-600" />
                                    <span>Vitalício (Comprado)</span>
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                    {shop.plan}
                                  </span>
                                )}
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${
                                    shop.status === 'ativa'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : shop.status === 'teste'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span className="capitalize">{shop.status}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Acesso Administrativo (Login) */}
                        <td className="p-3 text-gray-600">
                          <span className="block">
                            E-mail Painel: <strong>{shop.slug}@barber.com</strong>
                          </span>
                          <span className="text-xs text-indigo-600 block mt-1 break-all">
                            Link de Entrada: {clientTargetUrl}
                          </span>
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <button
                              onClick={() => onImpersonateTenant(shop.id)}
                              title="Acessar painel administrativo desta barbearia"
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                            >
                              <Store className="w-3 h-3" />
                              <span>Acessar Painel</span>
                            </button>
                            <button
                              onClick={() => onToggleStatus(shop.id)}
                              className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1"
                              title={shop.status === 'ativa' ? 'Pausar barbearia' : 'Ativar barbearia'}
                            >
                              <Power className="w-3 h-3" />
                              <span>{shop.status === 'ativa' ? 'Pausar' : 'Ativar'}</span>
                            </button>

                            {/* Ícone de LÁPIS para EDITAR */}
                            <button
                              onClick={() => {
                                setTenantToEdit(shop);
                                setEditForm({ ...shop });
                              }}
                              title="Editar dados da barbearia"
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 border border-blue-200 shadow-2xs"
                            >
                              <Pencil className="w-3 h-3 text-blue-600" />
                              <span>Editar</span>
                            </button>

                            {/* Ícone da LIXEIRA para EXCLUIR */}
                            <button
                              onClick={() => setTenantToDelete(shop)}
                              title="Excluir barbearia"
                              className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer text-[11px] font-medium flex items-center gap-1 border border-red-200 shadow-2xs"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </td>

                        {/* 3. QR Code do Cliente (Subdomínio) */}
                        <td className="p-3 flex flex-col items-center justify-center">
                          <div
                            id={`qrcode-${shop.id}`}
                            className="bg-white p-2 border border-gray-200 rounded shadow-sm inline-block cursor-pointer hover:border-amber-500 transition-colors"
                            onClick={() => setSelectedQrTenant(shop)}
                            title="Clique para ampliar / imprimir"
                          >
                            <QRCodeCanvas value={clientTargetUrl} size={90} />
                          </div>
                          <button
                            onClick={() => {
                              if (onTestClientLink) {
                                onTestClientLink(shop.slug);
                              } else {
                                window.open(clientTargetUrl, '_blank');
                              }
                            }}
                            className="text-xs text-amber-600 underline font-semibold mt-1 hover:text-amber-700 cursor-pointer"
                          >
                            Testar Link Cliente
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Confirmação de Exclusão de Inquilino */}
        {tenantToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl text-left relative text-gray-900 border border-red-200 animate-fade-in">
              <div className="flex items-center gap-3 text-red-600 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Excluir Inquilino</h4>
                  <p className="text-xs text-red-600 font-medium">Ação irreversível de exclusão</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 text-xs text-red-900 space-y-1">
                <p>Você está prestes a excluir permanentemente:</p>
                <p className="font-bold text-sm text-gray-900">💈 {tenantToDelete.name} ({tenantToDelete.slug})</p>
                <p className="text-gray-600">E-mail: {tenantToDelete.email}</p>
                <p className="text-gray-600 flex items-center gap-1">
                  Plano: {tenantToDelete.plan === 'Vitalício' ? '👑 Vitalício (Licença Comprada)' : tenantToDelete.plan}
                </p>
              </div>

              <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                Esta ação apagará todos os dados vinculados a este inquilino, incluindo barbeiros cadastrados, catálogo de serviços, cupons e histórico de agendamentos.
              </p>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTenantToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteTenant) {
                      onDeleteTenant(tenantToDelete.id);
                    }
                    setTenantToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-md shadow-red-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Exclusão</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Barbearia (Inquilino) */}
        {tenantToEdit && editForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl text-left relative text-gray-900 border border-gray-200 animate-fade-in max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
                <div className="flex items-center gap-2.5 text-blue-600">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-900">Editar Dados da Barbearia</h4>
                    <p className="text-xs text-gray-500">Atualize informações cadastrais, plano ou dados de acesso</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setTenantToEdit(null);
                    setEditForm(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Nome da Barbearia *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Subdomínio / Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.slug}
                      onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      E-mail Administrativo
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Contato / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Plano do SaaS
                    </label>
                    <select
                      value={editForm.plan}
                      onChange={(e) => setEditForm({ ...editForm, plan: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Starter">Starter (R$ 79/mês - 1 a 2 barbeiros)</option>
                      <option value="Pro">Pro (R$ 149/mês - Até 6 barbeiros + Fidelidade)</option>
                      <option value="Enterprise">Enterprise (R$ 249/mês - Ilimitado)</option>
                      <option value="Vitalício">👑 Vitalício (R$ 1.499 - Compra Definitiva do App)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Status da Operação
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="ativa">Ativa</option>
                      <option value="teste">Período de Teste</option>
                      <option value="suspensa">Suspensa / Pausada</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Slogan / Frase da Marca
                    </label>
                    <input
                      type="text"
                      value={editForm.slogan || ''}
                      onChange={(e) => setEditForm({ ...editForm, slogan: e.target.value })}
                      placeholder="Ex: Tradição e Estilo"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      value={editForm.pixKey || ''}
                      onChange={(e) => setEditForm({ ...editForm, pixKey: e.target.value })}
                      placeholder="contato@barbearia.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTenantToEdit(null);
                      setEditForm(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de QR Code para Impressão & Divulgação */}
        {selectedQrTenant && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center relative text-gray-900 animate-fade-in">
              <button
                onClick={() => setSelectedQrTenant(null)}
                className="absolute right-4 top-4 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center mx-auto mb-2 text-base shadow-sm">
                {selectedQrTenant.logoLetter || selectedQrTenant.name.charAt(0)}
              </div>

              <h4 className="text-base font-bold text-gray-900">{selectedQrTenant.name}</h4>
              <p className="text-xs text-gray-500 mb-4">
                Escaneie para agendar horário online
              </p>

              {/* QR Code Container com Canvas Real */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 inline-block mx-auto mb-4 shadow-inner">
                <QRCodeCanvas
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${window.location.pathname}?barber=${selectedQrTenant.slug}`
                      : `?barber=${selectedQrTenant.slug}`
                  }
                  size={200}
                />
              </div>

              <div className="text-xs font-mono text-gray-600 bg-gray-100 py-1.5 px-3 rounded-lg border border-gray-200 mb-4 break-all select-all">
                {typeof window !== 'undefined'
                  ? `${window.location.origin}${window.location.pathname}?barber=${selectedQrTenant.slug}`
                  : `?barber=${selectedQrTenant.slug}`}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?barber=${selectedQrTenant.slug}`;
                    navigator.clipboard.writeText(url);
                    setCopiedQrUrl(true);
                    setTimeout(() => setCopiedQrUrl(false), 2000);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedQrUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQrUrl ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  onClick={() => {
                    if (onTestClientLink) {
                      onTestClientLink(selectedQrTenant.slug);
                      setSelectedQrTenant(null);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Cadastro</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir QR</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
