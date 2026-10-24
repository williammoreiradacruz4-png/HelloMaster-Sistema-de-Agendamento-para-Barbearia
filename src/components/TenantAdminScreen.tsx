import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Scissors,
  Star,
  Megaphone,
  UserCheck,
  Settings,
  LogOut,
  Plus,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  ExternalLink,
  Gift,
  Tag,
  Palette,
  Phone,
  Store,
  ChevronRight,
  Shield,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye
} from 'lucide-react';
import {
  BarberTenant,
  BarberStaff,
  ServiceItem,
  LoyaltyReward,
  PromoCoupon,
  ClientRecord,
  Appointment,
  AppointmentStatus,
} from '../types/barber';
import barberInteriorImg from '../assets/images/barbershop_interior_1791312515543.jpg';
import { generateOperatingHours } from '../data/mockData';
import { NewAppointmentModal } from './NewAppointmentModal';
import { WhatsAppModal } from './WhatsAppModal';
import { NewStaffModal } from './NewStaffModal';
import { NewServiceModal } from './NewServiceModal';

interface TenantAdminScreenProps {
  tenant: BarberTenant;
  allTenants: BarberTenant[];
  onSelectTenant: (tenantId: string) => void;
  staffList: BarberStaff[];
  onAddStaff: (staff: BarberStaff) => void;
  onPayCommission: (staffId: string) => void;
  servicesList: ServiceItem[];
  onAddService: (service: ServiceItem) => void;
  onToggleService: (serviceId: string) => void;
  rewardsList: LoyaltyReward[];
  onAddReward: (reward: LoyaltyReward) => void;
  onRedeemReward: (clientId: string, rewardId: string) => void;
  couponsList: PromoCoupon[];
  onAddCoupon: (coupon: PromoCoupon) => void;
  onToggleCoupon: (code: string) => void;
  clientsList: ClientRecord[];
  onAddClient: (client: ClientRecord) => void;
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onUpdateTenantConfig: (updated: Partial<BarberTenant>) => void;
  onOpenClientPortal: (tenantSlug: string) => void;
  onLogout: () => void;
}

export type TenantTab =
  | 'tenant-agendamentos'
  | 'tenant-funcionarios'
  | 'tenant-servicos'
  | 'tenant-fidelidade'
  | 'tenant-promocoes'
  | 'tenant-clientes'
  | 'tenant-configuracoes';

export const TenantAdminScreen: React.FC<TenantAdminScreenProps> = ({
  tenant,
  allTenants,
  onSelectTenant,
  staffList,
  onAddStaff,
  onPayCommission,
  servicesList,
  onAddService,
  onToggleService,
  rewardsList,
  onAddReward,
  onRedeemReward,
  couponsList,
  onAddCoupon,
  onToggleCoupon,
  clientsList,
  onAddClient,
  appointments,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onUpdateTenantConfig,
  onOpenClientPortal,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TenantTab>('tenant-agendamentos');

  // Modals state
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    message: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    message: '',
  });

  // Appointments filter state
  const [filterDate, setFilterDate] = useState<'all' | 'today' | 'tomorrow'>('today');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBarber, setFilterBarber] = useState<string>('all');
  const [scheduleViewMode, setScheduleViewMode] = useState<'grade' | 'lista'>('grade');

  // New coupon form state
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState(15);
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');

  // New reward form state
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardPoints, setRewardPoints] = useState(70);
  const [rewardCat, setRewardCat] = useState<'Serviço' | 'Produto' | 'Desconto'>('Serviço');

  // Fast loyalty counter checkout
  const [loyaltySelectedClient, setLoyaltySelectedClient] = useState('');
  const [loyaltySelectedReward, setLoyaltySelectedReward] = useState('');

  // Brand config local state
  const [brandName, setBrandName] = useState(tenant.name);
  const [brandSlogan, setBrandSlogan] = useState(tenant.slogan);
  const [brandHours, setBrandHours] = useState(tenant.openingHours);
  const [brandAddress, setBrandAddress] = useState(tenant.address);
  const [brandPix, setBrandPix] = useState(tenant.pixKey || '');
  const [brandColor, setBrandColor] = useState(tenant.themeColor || 'amber');
  const [bannerFile, setBannerFile] = useState<string | null>(tenant.coverImage || null);
  const [configSaved, setConfigSaved] = useState(false);

  // Sincroniza estado e identidade visual quando muda a barbearia ativa
  React.useEffect(() => {
    setBrandName(tenant.name);
    setBrandSlogan(tenant.slogan);
    setBrandHours(tenant.openingHours);
    setBrandAddress(tenant.address);
    setBrandPix(tenant.pixKey || '');
    setBrandColor(tenant.themeColor || 'amber');
    setBannerFile(tenant.coverImage || null);
  }, [tenant]);

  // Exposição global da função renderTenantSchedule para compatibilidade direta
  React.useEffect(() => {
    (window as any).renderTenantSchedule = () => {
      const table = document.getElementById('tenant-schedule-table');
      if (!table) return;
      const hours = generateOperatingHours();

      table.innerHTML = hours
        .map((h) => {
          const bookingsForHour = appointments.filter(
            (b) =>
              (b.tenantId === tenant.id || b.tenantId === 'shop-1') &&
              b.time === h &&
              b.status !== 'Cancelado'
          );

          if (bookingsForHour.length > 0) {
            return bookingsForHour
              .map(
                (b) => `
                <tr class="border-b bg-amber-50/30">
                    <td class="p-3 font-bold text-gray-700">${h}</td>
                    <td class="p-3">
                        <span class="font-semibold text-gray-900">${b.clientName}</span>
                        <span class="block text-xs text-amber-700 font-medium">Profissional: ${b.barberName}</span>
                    </td>
                    <td class="p-3 text-sm text-gray-500">${b.serviceName}</td>
                </tr>
            `
              )
              .join('');
          } else {
            return `
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="p-3 font-bold text-gray-700">${h}</td>
                    <td class="p-3"><span class="text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded text-xs">Todos os Profissionais Livres</span></td>
                    <td class="p-3 text-sm text-gray-500">-</td>
                </tr>
            `;
          }
        })
        .join('');
    };
  }, [appointments, tenant.id]);

  // Filter appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((app) => {
    if (filterDate === 'today' && app.date !== todayStr) return false;
    if (filterDate === 'tomorrow' && app.date !== tomorrowStr) return false;
    if (filterStatus !== 'all' && app.status !== filterStatus) return false;
    if (filterBarber !== 'all' && app.barberId !== filterBarber) return false;
    return true;
  });

  // Today financial stats
  const todayApps = appointments.filter((a) => a.date === todayStr);
  const todayTotalRevenue = todayApps.reduce((acc, a) => acc + (a.status !== 'Cancelado' ? a.finalPrice : 0), 0);
  const todayCompleted = todayApps.filter((a) => a.status === 'Concluído').length;
  const todayPending = todayApps.filter((a) => a.status === 'Confirmado' || a.status === 'Pendente').length;

  const handleOpenWhatsApp = (app: Appointment) => {
    const msg = `Olá ${app.clientName}! Passando para confirmar seu horário na ${tenant.name} hoje às ${app.time} para o serviço de ${app.serviceName} com o profissional ${app.barberName}. Qualquer alteração avise aqui! 💈`;
    setWhatsAppModalData({
      isOpen: true,
      name: app.clientName,
      phone: app.clientPhone,
      message: msg,
    });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const newC: PromoCoupon = {
      id: `coup-${Date.now()}`,
      tenantId: tenant.id,
      code: couponCode.trim().toUpperCase(),
      discountType: couponType,
      discountValue: Number(couponVal) || 10,
      usageCount: 0,
      expiresAt: '2026-12-31',
      isActive: true,
    };
    onAddCoupon(newC);
    setCouponCode('');
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;
    const newR: LoyaltyReward = {
      id: `rew-${Date.now()}`,
      tenantId: tenant.id,
      title: rewardTitle.trim(),
      description: 'Recompensa do programa de fidelidade da barbearia.',
      pointsCost: Number(rewardPoints) || 50,
      category: rewardCat,
      claimedCount: 0,
    };
    onAddReward(newR);
    setRewardTitle('');
  };

  const handleRedeemLoyaltyCheckout = () => {
    if (!loyaltySelectedClient || !loyaltySelectedReward) return;
    onRedeemReward(loyaltySelectedClient, loyaltySelectedReward);
    setLoyaltySelectedReward('');
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBannerFile(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBrandConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTenantConfig({
      name: brandName,
      slogan: brandSlogan,
      openingHours: brandHours,
      address: brandAddress,
      pixKey: brandPix,
      themeColor: brandColor as any,
      coverImage: bannerFile || tenant.coverImage,
    });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  // Theme color accents
  const themeAccentBg =
    brandColor === 'emerald'
      ? 'bg-emerald-500'
      : brandColor === 'blue'
      ? 'bg-blue-600'
      : brandColor === 'rose'
      ? 'bg-rose-600'
      : brandColor === 'slate'
      ? 'bg-neutral-200 text-neutral-950'
      : 'bg-amber-500';

  const themeAccentText =
    brandColor === 'emerald'
      ? 'text-emerald-400'
      : brandColor === 'blue'
      ? 'text-blue-400'
      : brandColor === 'rose'
      ? 'text-rose-400'
      : brandColor === 'slate'
      ? 'text-neutral-100'
      : 'text-amber-500';

  const brandHex =
    brandColor === 'emerald'
      ? '#10b981'
      : brandColor === 'blue'
      ? '#3b82f6'
      : brandColor === 'rose'
      ? '#f43f5e'
      : brandColor === 'slate'
      ? '#475569'
      : '#f59e0b';

  // Sincroniza a variável de cor do CSS do tema (--brand-color)
  React.useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', brandHex);
  }, [brandHex]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR MENU */}
      <aside className="w-full md:w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shadow-xl shrink-0">
        {/* Brand header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center space-x-3 mb-3">
            <div
              id="tenant-logo-preview"
              className={`w-10 h-10 ${themeAccentBg} text-neutral-950 rounded-xl flex items-center justify-center font-bold text-lg shadow-md`}
            >
              {tenant.logoLetter || tenant.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 id="tenant-display-name" className="font-bold text-base text-white truncate font-display">
                {tenant.name}
              </h2>
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Plano {tenant.plan}</span>
              </span>
            </div>
          </div>

          {/* Quick tenant switcher if multiple exist */}
          {allTenants.length > 1 && (
            <div className="pt-2">
              <label className="text-[10px] uppercase font-semibold text-neutral-500 block mb-1">
                Alternar Filial / Inquilino
              </label>
              <select
                value={tenant.id}
                onChange={(e) => onSelectTenant(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                {allTenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <nav className="flex-1 p-3 space-y-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('tenant-agendamentos')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-agendamentos'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'tenant-agendamentos' ? themeAccentText : 'text-neutral-400'}`} />
            <span>🗓️ Agendamentos</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-funcionarios')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-funcionarios'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'tenant-funcionarios' ? themeAccentText : 'text-neutral-400'}`} />
            <span>👥 Funcionários & Comissões</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-servicos')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-servicos'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Scissors className={`w-4 h-4 ${activeTab === 'tenant-servicos' ? themeAccentText : 'text-neutral-400'}`} />
            <span>💈 Cadastro de Serviços</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-fidelidade')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-fidelidade'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'tenant-fidelidade' ? themeAccentText : 'text-neutral-400'}`} />
            <span>⭐ Pontos de Fidelidade</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-promocoes')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-promocoes'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Megaphone className={`w-4 h-4 ${activeTab === 'tenant-promocoes' ? themeAccentText : 'text-neutral-400'}`} />
            <span>📣 Painel de Promoções</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-clientes')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-clientes'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'tenant-clientes' ? themeAccentText : 'text-neutral-400'}`} />
            <span>👤 Clientes Ativos</span>
          </button>

          <button
            onClick={() => setActiveTab('tenant-configuracoes')}
            className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'tenant-configuracoes'
                ? 'bg-neutral-800 text-white font-semibold shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'tenant-configuracoes' ? themeAccentText : 'text-neutral-400'}`} />
            <span>⚙️ Customizar Marca</span>
          </button>
        </nav>

        {/* Public Booking Link Card */}
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={() => onOpenClientPortal(tenant.slug)}
            className="w-full p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Link do Cliente</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={onLogout}
            className="w-full mt-2 text-left py-2 px-3 rounded-lg text-red-400 hover:bg-red-950/30 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>🚪 Desconectar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* NOVO BANNER COMPLETO COM SUPORTE A FOTO DE FUNDO */}
        <div
          id="tenant-banner-header"
          className="w-full rounded-2xl p-8 mb-6 text-white shadow-xl flex items-center space-x-5 relative overflow-hidden bg-cover bg-center min-h-[140px] transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(23, 23, 23, 0.85), rgba(23, 23, 23, 0.4)), url('${bannerFile || tenant.coverImage || barberInteriorImg}')`,
          }}
        >
          {/* Overlay escuro para garantir que os textos fiquem sempre legíveis */}
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          {/* Conteúdo do Banner (Fica acima do fundo) */}
          <div
            id="tenant-banner-logo"
            className="relative z-10 w-16 h-16 bg-white text-black font-black rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white/40 shrink-0"
          >
            {tenant.logoLetter || tenant.name.charAt(0).toUpperCase()}
          </div>
          <div className="relative z-10 flex-1">
            <h1 id="tenant-banner-name" className="text-3xl font-extrabold tracking-wide drop-shadow-md">
              {brandName || tenant.name}
            </h1>
            <p className="text-xs text-amber-400 uppercase tracking-widest font-bold mt-1">
              Ambiente de Gestão Exclusivo
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. ABA AGENDAMENTOS */}
        {/* ======================================================== */}
        {activeTab === 'tenant-agendamentos' && (
          <section id="tab-tenant-agendamentos" className="space-y-6">
            {/* Top Bar with Metrics */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Agenda do Dia</h2>
                <p className="text-xs text-neutral-400">
                  Gerencie horários, marque presenças e notifique clientes no WhatsApp
                </p>
              </div>

              <button
                onClick={() => setIsNewAppModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                <span className="text-[11px] text-neutral-400 block mb-1">Agendados Hoje</span>
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  {todayApps.length}
                </span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                <span className="text-[11px] text-neutral-400 block mb-1">Concluídos</span>
                <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                  {todayCompleted}
                </span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                <span className="text-[11px] text-neutral-400 block mb-1">A Realizar</span>
                <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                  {todayPending}
                </span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
                <span className="text-[11px] text-neutral-400 block mb-1">Previsão Faturamento</span>
                <span className="text-xl font-bold font-mono text-white tabular-nums">
                  R$ {todayTotalRevenue.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => setScheduleViewMode('grade')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      scheduleViewMode === 'grade'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⏰ Grade Horária Operacional
                  </button>
                  <button
                    onClick={() => setScheduleViewMode('lista')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      scheduleViewMode === 'lista'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    📋 Lista de Agendamentos ({filteredAppointments.length})
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => setFilterDate('today')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterDate === 'today' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Hoje ({todayStr})
                  </button>
                  <button
                    onClick={() => setFilterDate('tomorrow')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterDate === 'tomorrow' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Amanhã
                  </button>
                  <button
                    onClick={() => setFilterDate('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      filterDate === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterBarber}
                  onChange={(e) => setFilterBarber(e.target.value)}
                  className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
                >
                  <option value="all">Todos os Barbeiros</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
                >
                  <option value="all">Todos os Status</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {scheduleViewMode === 'grade' ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-4 bg-neutral-950/70 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">Quadro Operacional de Horários</h3>
                    <p className="text-xs text-neutral-400">Mapeamento em tempo real de todos os horários livres e ocupados</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80 inline-flex items-center gap-1.5 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sincronizado com o App do Cliente
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-950 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800 font-bold">
                        <th className="p-3.5 w-28">Horário</th>
                        <th className="p-3.5">Cliente / Profissional</th>
                        <th className="p-3.5">Serviço</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-center">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody id="tenant-schedule-table" className="divide-y divide-neutral-800/70 text-xs">
                      {generateOperatingHours().map((h) => {
                        const bookingsForHour = appointments.filter(
                          (b) =>
                            (b.tenantId === tenant.id || b.tenantId === 'shop-1') &&
                            (filterDate === 'today'
                              ? b.date === todayStr
                              : filterDate === 'tomorrow'
                              ? b.date === tomorrowStr
                              : true) &&
                            (filterBarber === 'all' || b.barberId === filterBarber) &&
                            (filterStatus === 'all' || b.status === filterStatus) &&
                            b.time === h
                        );

                        if (bookingsForHour.length > 0) {
                          return bookingsForHour.map((b) => (
                            <tr key={b.id} className="border-b border-neutral-800/80 bg-amber-500/10 hover:bg-amber-500/15 transition-colors">
                              <td className="p-3.5 font-bold text-amber-400 font-mono text-sm">{h}</td>
                              <td className="p-3.5">
                                <span className="font-semibold text-white block">{b.clientName}</span>
                                <span className="block text-xs text-amber-300 font-medium">Profissional: {b.barberName}</span>
                              </td>
                              <td className="p-3.5 text-sm text-neutral-300">
                                <span className="font-medium text-white">{b.serviceName}</span>
                                <span className="text-[11px] text-neutral-400 block font-mono">R$ {b.finalPrice.toFixed(2)}</span>
                              </td>
                              <td className="p-3.5 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                                    b.status === 'Concluído'
                                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                      : b.status === 'Cancelado'
                                      ? 'bg-red-950/80 text-red-400 border border-red-800'
                                      : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {b.status !== 'Concluído' && b.status !== 'Cancelado' && (
                                    <>
                                      <button
                                        onClick={() => onUpdateAppointmentStatus(b.id, 'Concluído')}
                                        title="Marcar como Concluído"
                                        className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 transition-colors cursor-pointer"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onUpdateAppointmentStatus(b.id, 'Cancelado')}
                                        title="Cancelar agendamento"
                                        className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 transition-colors cursor-pointer"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleOpenWhatsApp(b)}
                                    title="Enviar lembrete no WhatsApp"
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-colors cursor-pointer"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ));
                        } else {
                          return (
                            <tr key={h} className="border-b border-neutral-800/60 hover:bg-neutral-800/30 transition-colors">
                              <td className="p-3.5 font-bold text-neutral-400 font-mono text-sm">{h}</td>
                              <td className="p-3.5">
                                <span className="text-emerald-400 font-medium bg-emerald-950/70 px-2.5 py-1 rounded text-xs border border-emerald-800/70 inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Todos os Profissionais Livres
                                </span>
                              </td>
                              <td className="p-3.5 text-sm text-neutral-500">-</td>
                              <td className="p-3.5 text-center">
                                <span className="text-xs text-emerald-400 font-medium">Disponível</span>
                              </td>
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => setIsNewAppModalOpen(true)}
                                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
                                >
                                  + Agendar
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-950 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                        <th className="p-3.5">Horário & Data</th>
                        <th className="p-3.5">Cliente</th>
                        <th className="p-3.5">Serviço</th>
                        <th className="p-3.5">Barbeiro</th>
                        <th className="p-3.5 text-right">Valor</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-center">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody id="tenant-schedule-table-list" className="divide-y divide-neutral-800/80 text-xs">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-neutral-500">
                            Nenhum agendamento encontrado para o filtro selecionado.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((app) => (
                          <tr key={app.id} className="hover:bg-neutral-800/40 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-200">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>{app.time}</span>
                              </div>
                              <span className="text-[10px] text-neutral-500 block">{app.date}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-semibold text-neutral-100 block">{app.clientName}</span>
                              <span className="text-[11px] text-neutral-500">{app.clientPhone}</span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-medium text-neutral-200 block">{app.serviceName}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{app.durationMinutes} min</span>
                            </td>
                            <td className="p-3.5 text-neutral-300">
                              {app.barberName}
                            </td>
                            <td className="p-3.5 text-right font-mono font-semibold tabular-nums text-neutral-200">
                              R$ {app.finalPrice.toFixed(2)}
                              {app.couponCode && (
                                <span className="text-[10px] block text-emerald-400">-{app.couponCode}</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold inline-flex items-center gap-1 ${
                                  app.status === 'Concluído'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                    : app.status === 'Cancelado'
                                    ? 'bg-red-950/80 text-red-400 border border-red-800'
                                    : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                <span>{app.status}</span>
                              </span>
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {app.status !== 'Concluído' && app.status !== 'Cancelado' && (
                                  <>
                                    <button
                                      onClick={() => onUpdateAppointmentStatus(app.id, 'Concluído')}
                                      title="Marcar como Concluído (credita pontos e comissão)"
                                      className="p-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/60 transition-colors cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onUpdateAppointmentStatus(app.id, 'Cancelado')}
                                      title="Cancelar agendamento"
                                      className="p-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-700/60 transition-colors cursor-pointer"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => handleOpenWhatsApp(app)}
                                  title="Enviar lembrete no WhatsApp"
                                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-emerald-400 transition-colors cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. ABA FUNCIONÁRIOS & COMISSÕES */}
        {/* ======================================================== */}
        {activeTab === 'tenant-funcionarios' && (
          <section id="tab-tenant-funcionarios" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Equipe & Comissões</h2>
                <p className="text-xs text-neutral-400">
                  Acompanhe os cortes realizados por cada profissional e feche as comissões
                </p>
              </div>

              <button
                onClick={() => setIsNewStaffModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Barbeiro</span>
              </button>
            </div>

            {/* Commission summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <span className="text-xs text-neutral-400 block mb-1">Total Comissões Geradas</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-white">
                  R$ {staffList.reduce((acc, s) => acc + s.totalEarned, 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">Histórico acumulado</span>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <span className="text-xs text-neutral-400 block mb-1">Pendente de Pagamento</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-amber-400">
                  R$ {staffList.reduce((acc, s) => acc + s.pendingPayout, 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-amber-500/80 mt-1 block">A acertar com os barbeiros</span>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <span className="text-xs text-neutral-400 block mb-1">Cortes Realizados no Mês</span>
                <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                  {staffList.reduce((acc, s) => acc + s.completedCuts, 0)} cortes
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block">Produtividade da equipe</span>
              </div>
            </div>

            {/* Staff list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      {staff.avatarUrl ? (
                        <img
                          src={staff.avatarUrl}
                          alt={staff.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-800 text-amber-500 font-bold flex items-center justify-center text-lg border border-neutral-700">
                          {staff.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-sm">{staff.name}</h3>
                        <p className="text-xs text-neutral-400">{staff.role}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">{staff.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-2 py-3 border-t border-b border-neutral-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Comissão por serviço:</span>
                        <span className="font-bold text-amber-400 font-mono">{staff.commissionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Cortes concluídos:</span>
                        <span className="font-mono text-neutral-200">{staff.completedCuts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Pendente a pagar:</span>
                        <span className="font-mono font-bold text-amber-400">
                          R$ {staff.pendingPayout.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => onPayCommission(staff.id)}
                      disabled={staff.pendingPayout <= 0}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                        staff.pendingPayout > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950'
                          : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        {staff.pendingPayout > 0
                          ? `Pagar R$ ${staff.pendingPayout.toFixed(2)}`
                          : 'Comissão em dia'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 3. ABA CADASTRO DE SERVIÇOS */}
        {/* ======================================================== */}
        {activeTab === 'tenant-servicos' && (
          <section id="tab-tenant-servicos" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Catálogo de Serviços</h2>
                <p className="text-xs text-neutral-400">
                  Defina os serviços, durações, preços e pontuações de fidelidade
                </p>
              </div>

              <button
                onClick={() => setIsNewServiceModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Serviço</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicesList.map((service) => (
                <div
                  key={service.id}
                  className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    service.isActive ? 'border-neutral-800' : 'border-neutral-800/40 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {service.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        +{service.loyaltyPointsAwarded} pts fidelidade
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
                    <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-500 block">Tempo: {service.durationMinutes} min</span>
                      <span className="text-lg font-bold font-mono text-white">
                        R$ {service.price.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleService(service.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        service.isActive
                          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {service.isActive ? 'Pausar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 4. ABA PONTOS DE FIDELIDADE */}
        {/* ======================================================== */}
        {activeTab === 'tenant-fidelidade' && (
          <section id="tab-tenant-fidelidade" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Programa de Fidelidade</h2>
                <p className="text-xs text-neutral-400">
                  Engaje clientes recorrentes com recompensas e resgate instantâneo no balcão
                </p>
              </div>
            </div>

            {/* Fast counter redemption box */}
            <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-amber-400 font-bold text-sm">
                <Gift className="w-4 h-4" />
                <span>Balcão de Resgate de Pontos de Fidelidade</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Selecionar Cliente
                  </label>
                  <select
                    value={loyaltySelectedClient}
                    onChange={(e) => setLoyaltySelectedClient(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Escolha o Cliente --</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Saldo: {c.loyaltyPoints} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Recompensa Desejada
                  </label>
                  <select
                    value={loyaltySelectedReward}
                    onChange={(e) => setLoyaltySelectedReward(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Escolha a Recompensa --</option>
                    {rewardsList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} ({r.pointsCost} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRedeemLoyaltyCheckout}
                    disabled={!loyaltySelectedClient || !loyaltySelectedReward}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      loyaltySelectedClient && loyaltySelectedReward
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Resgatar e Deduzir Pontos</span>
                  </button>
                </div>
              </div>

              {loyaltySelectedClient && (
                <div className="text-xs text-neutral-400 bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80">
                  {(() => {
                    const c = clientsList.find((x) => x.id === loyaltySelectedClient);
                    const r = rewardsList.find((x) => x.id === loyaltySelectedReward);
                    if (!c) return null;
                    const canAfford = r ? c.loyaltyPoints >= r.pointsCost : false;
                    return (
                      <div className="flex items-center justify-between">
                        <span>
                          Saldo atual de <strong>{c.name}</strong>: <strong className="text-amber-400">{c.loyaltyPoints} pts</strong>
                        </span>
                        {r && (
                          <span className={canAfford ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                            {canAfford
                              ? `✓ Pontos suficientes (sobrará ${c.loyaltyPoints - r.pointsCost} pts)`
                              : `✗ Faltam ${r.pointsCost - c.loyaltyPoints} pts para resgatar esta recompensa`}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Rewards catalog + form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form create new reward */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 h-fit">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>Nova Recompensa</span>
                </h3>
                <form onSubmit={handleCreateReward} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Título</label>
                    <input
                      type="text"
                      required
                      value={rewardTitle}
                      onChange={(e) => setRewardTitle(e.target.value)}
                      placeholder="Ex: Corte Degustação Grátis"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Custo em Pontos</label>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={rewardPoints}
                        onChange={(e) => setRewardPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Categoria</label>
                      <select
                        value={rewardCat}
                        onChange={(e) => setRewardCat(e.target.value as any)}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Serviço">Serviço</option>
                        <option value="Produto">Produto</option>
                        <option value="Desconto">Desconto</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Adicionar ao Catálogo
                  </button>
                </form>
              </div>

              {/* Active rewards list */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white mb-2">Recompensas Disponíveis para Clientes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rewardsList.map((r) => (
                    <div
                      key={r.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300">
                            {r.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{r.pointsCost} pts</span>
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">{r.title}</h4>
                        <p className="text-xs text-neutral-400">{r.description}</p>
                      </div>
                      <div className="pt-3 mt-3 border-t border-neutral-800 text-[11px] text-neutral-500 flex justify-between">
                        <span>Resgatados até hoje:</span>
                        <span className="font-mono text-neutral-300">{r.claimedCount} vezes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 5. ABA PAINEL DE PROMOÇÕES */}
        {/* ======================================================== */}
        {activeTab === 'tenant-promocoes' && (
          <section id="tab-tenant-promocoes" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Painel de Promoções & Cupons</h2>
                <p className="text-xs text-neutral-400">
                  Crie campanhas para encher horários vazios e cupons para novos clientes
                </p>
              </div>
            </div>

            {/* Quick Promo Card: Happy Hour */}
            <div className="bg-gradient-to-r from-indigo-950/60 to-neutral-900 border border-indigo-700/50 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Promoção Inteligente Sugerida
                </span>
                <h3 className="text-base font-bold text-white mt-1">Terça & Quarta do Barbeiro (-20% em Todos os Combos)</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Preenche horários ociosos de início de semana automaticamente na página de agendamento.
                </p>
              </div>
              <button
                onClick={() => {
                  const exists = couponsList.find((c) => c.code === 'TERCA20');
                  if (!exists) {
                    onAddCoupon({
                      id: `coup-${Date.now()}`,
                      tenantId: tenant.id,
                      code: 'TERCA20',
                      discountType: 'percentage',
                      discountValue: 20,
                      usageCount: 0,
                      expiresAt: '2026-12-31',
                      isActive: true,
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap shadow-md shadow-indigo-950"
              >
                Ativar Campanha TERCA20
              </button>
            </div>

            {/* New coupon and coupon list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 h-fit">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Criar Novo Cupom</span>
                </h3>
                <form onSubmit={handleCreateCoupon} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Código do Cupom</label>
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="EX: FIMDESEMANA"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono uppercase text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Tipo de Desconto</label>
                      <select
                        value={couponType}
                        onChange={(e) => setCouponType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Valor Fixo (R$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Valor do Desconto</label>
                      <input
                        type="number"
                        min="1"
                        value={couponVal}
                        onChange={(e) => setCouponVal(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Publicar Cupom
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-sm font-bold text-white mb-2">Cupons Ativos na Barbearia</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {couponsList.map((cup) => (
                    <div
                      key={cup.id}
                      className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between ${
                        cup.isActive ? 'border-neutral-800' : 'border-neutral-800/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-sm font-bold bg-neutral-950 border border-amber-500/40 text-amber-400 px-2.5 py-1 rounded-lg">
                          {cup.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {cup.discountType === 'percentage'
                            ? `${cup.discountValue}% OFF`
                            : `R$ ${cup.discountValue} OFF`}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 space-y-1 mb-3">
                        <div>Usos registrados: <strong className="text-white font-mono">{cup.usageCount}</strong></div>
                        <div>Válido até: <strong className="text-white font-mono">{cup.expiresAt}</strong></div>
                      </div>

                      <div className="pt-2 border-t border-neutral-800 flex justify-end">
                        <button
                          onClick={() => onToggleCoupon(cup.code)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        >
                          {cup.isActive ? 'Desativar' : 'Reativar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 6. ABA CLIENTES ATIVOS */}
        {/* ======================================================== */}
        {activeTab === 'tenant-clientes' && (
          <section id="tab-tenant-clientes" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Clientes & Histórico CRM</h2>
                <p className="text-xs text-neutral-400">
                  Visualize a frequência, total gasto e dispare mensagens personalizadas
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-950 text-[11px] uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Contato</th>
                      <th className="p-3.5">Bairro / Cidade</th>
                      <th className="p-3.5 text-center">Visitas</th>
                      <th className="p-3.5 text-right">Total Gasto</th>
                      <th className="p-3.5 text-center">Fidelidade</th>
                      <th className="p-3.5 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80 text-xs">
                    {clientsList.map((client) => (
                      <tr key={client.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-semibold text-neutral-100 block">{client.name}</span>
                          {client.notes && (
                            <span className="text-[10px] text-neutral-500 italic truncate max-w-xs block">
                              {client.notes}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-neutral-300">
                          {client.phone}
                        </td>
                        <td className="p-3.5 text-neutral-400">
                          {client.bairro ? `${client.bairro}, ${client.city || 'SP'}` : 'São Paulo - SP'}
                        </td>
                        <td className="p-3.5 text-center font-mono tabular-nums text-neutral-200">
                          {client.totalVisits}
                        </td>
                        <td className="p-3.5 text-right font-mono tabular-nums font-semibold text-emerald-400">
                          R$ {client.totalSpent.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {client.loyaltyPoints} pts
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              const msg = `Olá ${client.name}! Faz alguns dias desde seu último corte aqui na ${tenant.name}. Que tal dar um trato no visual esta semana? Nosso link para agendar é: https://barbersaas.com/${tenant.slug}`;
                              setWhatsAppModalData({
                                isOpen: true,
                                name: client.name,
                                phone: client.phone,
                                message: msg,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/60 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 7. ABA CUSTOMIZAR MARCA */}
        {/* ======================================================== */}
        {activeTab === 'tenant-configuracoes' && (
          <section id="tab-tenant-configuracoes" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Customizar Marca & Identidade</h2>
                <p className="text-xs text-neutral-400">
                  Personalize as cores, endereço, chave PIX e horários da sua barbearia
                </p>
              </div>

              {configSaved && (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>Configurações salvas com sucesso!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <form onSubmit={handleSaveBrandConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Nome da Barbearia
                      </label>
                      <input
                        type="text"
                        required
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Slogan da Marca
                      </label>
                      <input
                        type="text"
                        value={brandSlogan}
                        onChange={(e) => setBrandSlogan(e.target.value)}
                        placeholder="Ex: Tradição e estilo impecável"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Theme Color Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-2">
                      Paleta de Cores do Sistema & Portal
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'amber', name: 'Dourado Âmbar', colorClass: 'bg-amber-500' },
                        { id: 'emerald', name: 'Esmeralda Nobre', colorClass: 'bg-emerald-500' },
                        { id: 'blue', name: 'Safira Clássico', colorClass: 'bg-blue-600' },
                        { id: 'rose', name: 'Vinho Carmim', colorClass: 'bg-rose-600' },
                        { id: 'slate', name: 'Preto Matte', colorClass: 'bg-neutral-800' },
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setBrandColor(th.id as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                            brandColor === th.id
                              ? 'border-white bg-neutral-800 ring-2 ring-amber-500/30'
                              : 'border-neutral-800 bg-neutral-950 hover:bg-neutral-800/50'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full ${th.colorClass} shadow-md`} />
                          <span className="text-[11px] font-medium text-neutral-300">{th.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Horários de Atendimento
                      </label>
                      <input
                        type="text"
                        value={brandHours}
                        onChange={(e) => setBrandHours(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Chave PIX da Barbearia
                      </label>
                      <input
                        type="text"
                        value={brandPix}
                        onChange={(e) => setBrandPix(e.target.value)}
                        placeholder="contato@barbearia.com.br"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                      Endereço da Barbearia
                    </label>
                    <input
                      type="text"
                      value={brandAddress}
                      onChange={(e) => setBrandAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Foto de Capa do Banner antes do botão */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Foto de Capa do Banner (Formatos de imagem)</label>
                    <input
                      type="file"
                      id="cfg-banner-file"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                    />
                    {bannerFile && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={bannerFile}
                          alt="Prévia do Banner"
                          className="w-16 h-10 object-cover rounded-lg border border-neutral-700 shadow-sm"
                        />
                        <span className="text-xs text-emerald-400 font-medium">Foto selecionada para o banner</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      Salvar Alterações da Marca
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-3">
                    Pré-Visualização da Página
                  </span>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 text-center">
                    <div
                      className={`w-14 h-14 mx-auto rounded-2xl ${themeAccentBg} flex items-center justify-center text-xl font-bold mb-3 shadow-lg`}
                    >
                      {brandName.charAt(0) || 'B'}
                    </div>
                    <h4 className="font-bold text-white text-base font-display">{brandName}</h4>
                    <p className="text-xs text-neutral-400 mt-1 italic">&quot;{brandSlogan}&quot;</p>
                    <div className="mt-3 pt-3 border-t border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                      <p className="flex items-center justify-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{brandAddress}</span>
                      </p>
                      <p className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{brandHours}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => onOpenClientPortal(tenant.slug)}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Testar Portal Como Cliente</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODALS */}
      <NewAppointmentModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        tenantId={tenant.id}
        staffList={staffList}
        servicesList={servicesList}
        clientsList={clientsList}
        onSave={onAddAppointment}
      />

      <NewStaffModal
        isOpen={isNewStaffModalOpen}
        onClose={() => setIsNewStaffModalOpen(false)}
        tenantId={tenant.id}
        onSave={onAddStaff}
      />

      <NewServiceModal
        isOpen={isNewServiceModalOpen}
        onClose={() => setIsNewServiceModalOpen(false)}
        tenantId={tenant.id}
        onSave={onAddService}
      />

      <WhatsAppModal
        isOpen={whatsAppModalData.isOpen}
        onClose={() => setWhatsAppModalData((prev) => ({ ...prev, isOpen: false }))}
        clientName={whatsAppModalData.name}
        clientPhone={whatsAppModalData.phone}
        defaultMessage={whatsAppModalData.message}
      />
    </div>
  );
};
