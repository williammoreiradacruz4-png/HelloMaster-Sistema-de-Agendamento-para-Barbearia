import React, { useState } from 'react';
import {
  Scissors,
  Calendar,
  Clock,
  User,
  Star,
  Gift,
  CheckCircle2,
  Tag,
  Phone,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  MapPin,
  LogIn,
  Check,
  AlertCircle,
  MessageSquare,
  LogOut
} from 'lucide-react';
import {
  BarberTenant,
  BarberStaff,
  ServiceItem,
  LoyaltyReward,
  PromoCoupon,
  ClientRecord,
  Appointment,
} from '../types/barber';
import { barberInteriorImg, generateOperatingHours } from '../data/mockData';

interface ClientPortalScreenProps {
  tenant: BarberTenant;
  allTenants: BarberTenant[];
  onSelectTenant: (tenantId: string) => void;
  staffList: BarberStaff[];
  servicesList: ServiceItem[];
  rewardsList: LoyaltyReward[];
  couponsList: PromoCoupon[];
  clientUser?: ClientRecord | null;
  clientAppointments: Appointment[];
  allTenantAppointments?: Appointment[];
  onBookAppointment: (appointment: Appointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onBackToLogin: () => void;
}

export const ClientPortalScreen: React.FC<ClientPortalScreenProps> = ({
  tenant,
  allTenants,
  onSelectTenant,
  staffList,
  servicesList,
  rewardsList,
  couponsList,
  clientUser,
  clientAppointments,
  allTenantAppointments,
  onBookAppointment,
  onCancelAppointment,
  onBackToLogin,
}) => {
  const [viewTab, setViewTab] = useState<'agendar' | 'meus-agendamentos' | 'fidelidade'>('agendar');

  // Booking Flow Steps
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(servicesList[0] || null);
  const [selectedBarber, setSelectedBarber] = useState<BarberStaff | null>(
    staffList.find((s) => s.name.toLowerCase().includes('rodrigo')) || staffList[1] || staffList[0] || null
  );
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-07');
  const [selectedTime, setSelectedTime] = useState<string>('11:30');
  const [clientName, setClientName] = useState(clientUser?.name || 'Carlos Henrique Silva');
  const [clientPhone, setClientPhone] = useState(clientUser?.phone || '(11) 99123-4567');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<Appointment | null>(null);

  // Available Time Slots (Grade Horária Comercial 07:00 às 11:30 e 13:00 às 20:00)
  const timeSlots = generateOperatingHours();

  // Grade de horários ocupados para o barbeiro selecionado nesta data (bolinhas em tempo real)
  const bookingsForAvailability = allTenantAppointments || clientAppointments;
  const occupiedHours = bookingsForAvailability
    .filter(
      (app) =>
        app.status !== 'Cancelado' &&
        app.date === selectedDate &&
        (selectedBarber ? app.barberId === selectedBarber.id : false)
    )
    .map((app) => app.time);

  // Auto-sync selectedService and selectedBarber when servicesList or staffList updates
  React.useEffect(() => {
    if (!selectedService || !servicesList.some((s) => s.id === selectedService.id)) {
      if (servicesList.length > 0) {
        setSelectedService(servicesList[0]);
      }
    }
  }, [servicesList, selectedService]);

  React.useEffect(() => {
    if (!selectedBarber && staffList.length > 0) {
      setSelectedBarber(staffList[0]);
    } else if (selectedBarber && !staffList.some((s) => s.id === selectedBarber.id)) {
      setSelectedBarber(staffList[0] || null);
    }
  }, [staffList, selectedBarber]);

  React.useEffect(() => {
    (window as any).logout = onBackToLogin;
    (window as any).executeClientBooking = () => executeClientBooking();
  }, [onBackToLogin]);

  // Coupon handling
  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponCode.trim()) return;

    const found = couponsList.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive
    );

    if (!found) {
      setCouponError('Cupom inválido ou expirado.');
      setAppliedCoupon(null);
      return;
    }

    if (found.minSpend && selectedService && selectedService.price < found.minSpend) {
      setCouponError(`Gasto mínimo de R$ ${found.minSpend.toFixed(2)} para este cupom.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
  };

  const calculateFinalPrice = () => {
    if (!selectedService) return 0;
    let base = selectedService.price;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        base = base - (base * appliedCoupon.discountValue) / 100;
      } else {
        base = Math.max(0, base - appliedCoupon.discountValue);
      }
    }
    return base;
  };

  const executeClientBooking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const barberSelectEl = document.getElementById('client-select-barber') as HTMLSelectElement | null;
    const hourSelectEl = document.getElementById('client-select-hour') as HTMLSelectElement | null;
    const serviceSelectEl = document.getElementById('client-select-service') as HTMLSelectElement | null;

    const barberId =
      selectedBarber?.id ||
      barberSelectEl?.value ||
      staffList[0]?.id ||
      '';
    const hour =
      selectedTime ||
      hourSelectEl?.value ||
      timeSlots[0] ||
      '';
    const sId =
      selectedService?.id ||
      serviceSelectEl?.value ||
      servicesList[0]?.id ||
      '';

    const service = servicesList.find((s) => s.id === sId) || selectedService || servicesList[0];
    const customer = clientUser;
    const barber = staffList.find((f) => f.id === barberId) || selectedBarber || staffList[0];

    if (!hour || !service || !barber) {
      alert("Preencha todos os campos do agendamento (Profissional, Serviço e Horário).");
      return;
    }

    if (occupiedHours.includes(hour)) {
      alert(`O horário ${hour} já está reservado com o profissional ${barber.name}. Por favor, escolha outro horário livre.`);
      return;
    }

    const cName = customer ? customer.name : (clientName.trim() || 'Cliente Registrado');
    const cPhone = customer ? customer.phone : (clientPhone.trim() || '(11) 99999-9999');
    const finalVal = calculateFinalPrice();

    // Salva o agendamento atrelado especificamente àquele barbeiro
    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      tenantId: tenant.id,
      clientName: cName,
      clientPhone: cPhone,
      clientId: customer?.id,
      serviceId: service.id,
      serviceName: service.name,
      barberId: barber.id,
      barberName: barber.name,
      date: selectedDate,
      time: hour,
      durationMinutes: service.durationMinutes,
      price: service.price,
      finalPrice: finalVal,
      couponCode: appliedCoupon?.code,
      status: 'Confirmado',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onBookAppointment(newApp);
    setBookingConfirmed(newApp);
    alert(`Agendamento confirmado com o profissional ${barber.name} para as ${hour}!`);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    executeClientBooking(e);
  };

  const resetBookingForm = () => {
    setBookingConfirmed(null);
    setSelectedService(servicesList[0] || null);
    setSelectedBarber(null);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  return (
    <div id="screen-client-app" className="min-h-screen bg-neutral-950 text-gray-100 flex flex-col font-sans">
      {/* HEADER EXATO DA IMAGEM */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50 py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Logo + Name + Slogan + Shop Select */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-base shadow">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white" id="client-view-barber-name">
                  {tenant.name}
                </span>
                {allTenants.length > 1 && (
                  <select
                    value={tenant.id}
                    onChange={(e) => onSelectTenant(e.target.value)}
                    className="bg-neutral-900 border border-neutral-700 text-amber-400 text-xs rounded px-2 py-0.5 cursor-pointer focus:outline-none"
                    title="Trocar barbearia / unidade"
                  >
                    {allTenants.map((t) => (
                      <option key={t.id} value={t.id} className="bg-neutral-900 text-white">
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 leading-tight">
                {tenant.slogan || "Tradição e excelência em barba e cabelo"}
              </p>
            </div>
          </div>

          {/* Center: Tabs */}
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setViewTab('agendar')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'agendar'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Agendar Horário
            </button>
            <button
              onClick={() => setViewTab('meus-agendamentos')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'meus-agendamentos'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Meus Cortes ({clientAppointments.length})
            </button>
            <button
              onClick={() => setViewTab('fidelidade')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewTab === 'fidelidade'
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Fidelidade
            </button>
          </div>

          {/* Right: Client points + Voltar ao Sistema */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl text-xs text-neutral-300">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-white">
                {clientUser ? clientUser.name.split(' ')[0] : 'Carlos'}
              </span>
              <span className="text-amber-400 font-mono font-bold">
                ({clientUser ? (clientUser.fidelityPoints ?? clientUser.loyaltyPoints) : 85} pts)
              </span>
            </div>

            <button
              onClick={onBackToLogin}
              className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-neutral-800 cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Voltar ao Sistema</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT RESPONSIVO */}
      <main className="flex-1 max-w-xl mx-auto w-full py-6 px-4 space-y-5">
        {/* ======================================================== */}
        {/* 1. ABA AGENDAR HORÁRIO */}
        {/* ======================================================== */}
        {viewTab === 'agendar' && (
          <div className="space-y-5">
            {/* Confirmation Screen if booked */}
            {bookingConfirmed ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center max-w-xl mx-auto animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold font-display text-white">Horário Reservado com Sucesso!</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Seu corte está garantido na {tenant.name}. Enviamos a confirmação.
                </p>

                <div className="my-6 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Serviço:</span>
                    <span className="font-bold text-white">{bookingConfirmed.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Barbeiro:</span>
                    <span className="font-semibold text-neutral-200">{bookingConfirmed.barberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Data e Horário:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {bookingConfirmed.date} às {bookingConfirmed.time}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400">Total a Pagar na Barbearia:</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      R$ {bookingConfirmed.finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-400/90 pt-1">
                    <span>Pontos de Fidelidade que você ganhará:</span>
                    <span>+{bookingConfirmed.price >= 80 ? 35 : 20} pontos</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/55${tenant.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Olá! Acabei de agendar na ${tenant.name} para o dia ${bookingConfirmed.date} às ${bookingConfirmed.time} (${bookingConfirmed.serviceName}). Meu nome é ${bookingConfirmed.clientName}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Confirmar via WhatsApp da Loja</span>
                  </a>

                  <button
                    onClick={resetBookingForm}
                    className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                  >
                    Fazer Outro Agendamento
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. HERO BANNER COM FOTO DA BARBEARIA */}
                <div id="carousel-container" className="relative rounded-2xl overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900 min-h-[140px] flex flex-col justify-end p-5">
                  <img
                    src={tenant.coverImage || barberInteriorImg}
                    alt={tenant.name}
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-30 filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 block" id="carousel-title">
                      AGENDAMENTO ONLINE INSTANTÂNEO
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white font-display leading-tight" id="carousel-text">
                      Renove seu estilo na {tenant.name}
                    </h2>
                    <p className="text-xs text-neutral-300">
                      {tenant.slogan || "Tradição e excelência em barba e cabelo"} • {tenant.address || "Av. Paulista, 1200 - Sala 402"}
                    </p>
                  </div>
                </div>

                {/* 2. CARD BRANCO: AGENDAR UM HORÁRIO (SELECTS COM STATUS) */}
                <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 text-gray-800">
                  <h3 className="font-bold text-gray-700 mb-4 text-base">Agendar um Horário</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Selecione o Profissional:
                      </label>
                      <select
                        id="client-select-barber"
                        value={selectedBarber ? selectedBarber.id : (staffList[0]?.id || '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = staffList.find((s) => s.id === val) || null;
                          setSelectedBarber(found);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {staffList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Escolha o serviço:
                      </label>
                      <select
                        id="client-select-service"
                        value={selectedService ? selectedService.id : (servicesList[0]?.id || '')}
                        onChange={(e) => {
                          const found = servicesList.find((s) => s.id === e.target.value) || null;
                          setSelectedService(found);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} - R$ {s.price.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Escolha o horário livre:
                      </label>
                      <select
                        id="client-select-hour"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {timeSlots.map((h) => {
                          const isBusy = occupiedHours.includes(h);
                          return (
                            <option
                              key={h}
                              value={h}
                              disabled={isBusy}
                              className={isBusy ? 'text-red-500' : 'text-emerald-600'}
                            >
                              {isBusy ? `🔴 ${h} - Ocupado` : `🟢 ${h} - Disponível`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => executeClientBooking()}
                      className="w-full bg-amber-500 text-white font-bold py-2.5 rounded-lg shadow hover:bg-amber-600 transition-transform active:scale-95 cursor-pointer"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </div>

                {/* 3. CARD BRANCO: CARTELA DE FIDELIDADE DIGITAL */}
                {(() => {
                  const pts = clientUser ? (clientUser.fidelityPoints ?? 5) : 5;
                  return (
                    <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 text-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-700 text-sm">Cartela de Fidelidade Digital</h3>
                          <p className="text-[11px] text-gray-500">
                            Acumule 10 carimbos e ganhe um prêmio no balcão da barbearia!
                          </p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          {pts % 10 || 5}/10 Carimbos
                        </span>
                      </div>

                      <div id="fidelity-stars-grid" className="flex flex-wrap gap-2 justify-center py-2">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((starNum) => {
                          const isFilled = starNum <= (pts % 10 === 0 && pts > 0 ? 10 : (pts % 10 || 5));
                          return (
                            <div
                              key={starNum}
                              className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-base transition-all duration-300 ${
                                isFilled
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                                  : 'bg-gray-100 text-gray-300 border-gray-200'
                              }`}
                            >
                              ★
                            </div>
                          );
                        })}
                      </div>

                      <div
                        id="fidelity-alert-box"
                        className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium text-center"
                      >
                        🏆 Parabéns você completou a cartela! Solicite seu prêmio direto no estabelecimento.
                      </div>
                    </div>
                  );
                })()}

                {/* 4. CARD ESCURO: FLUXO COMPLETO INTERATIVO DE AGENDAMENTO */}
                <form onSubmit={handleConfirmBooking} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-6 text-gray-100">
                  {/* Step 1: Select Service */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <span>Escolha o Serviço</span>
                      </h3>
                      <span className="text-xs text-neutral-400">{servicesList.length} serviços disponíveis</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {servicesList.map((service) => {
                        const isSelected = selectedService?.id === service.id;
                        return (
                          <div
                            key={service.id}
                            onClick={() => setSelectedService(service)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/5'
                                : 'bg-neutral-950 border-neutral-800/80 text-neutral-300 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-sm text-white">{service.name}</span>
                              <span className="font-mono text-sm font-bold text-amber-400">
                                R$ {service.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mb-3">
                              {service.description}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-neutral-800/60 font-mono">
                              <span>⏱️ {service.durationMinutes} min</span>
                              <span className="text-amber-500/90 font-semibold">+{service.loyaltyPointsAwarded} pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Select Barber Staff */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold flex items-center justify-center">
                          2
                        </span>
                        <span>Escolha o Profissional</span>
                      </h3>
                      <span className="text-xs text-neutral-400">
                        {selectedBarber ? selectedBarber.name : 'Qualquer profissional'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => setSelectedBarber(null)}
                        className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                          selectedBarber === null
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center mb-2">
                          <Scissors className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white block">Primeiro Livre</span>
                        <span className="text-[10px] text-neutral-500">Mais rápido</span>
                      </div>

                      {staffList.map((staff) => {
                        const isSelected = selectedBarber?.id === staff.id;
                        return (
                          <div
                            key={staff.id}
                            onClick={() => setSelectedBarber(staff)}
                            className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-white'
                                : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                            }`}
                          >
                            {staff.avatarUrl ? (
                              <img
                                src={staff.avatarUrl}
                                alt={staff.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 mx-auto rounded-xl object-cover mb-2 border border-neutral-700"
                              />
                            ) : (
                              <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-800 text-amber-500 font-bold flex items-center justify-center mb-2">
                                {staff.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-xs font-bold text-white block truncate">{staff.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-neutral-500 truncate block">{staff.role}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Date and Time Slot */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-xs font-bold flex items-center justify-center">
                          3
                        </span>
                        <span>Data e Horário</span>
                      </h3>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {timeSlots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        const isOccupied = occupiedHours.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isOccupied}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              isOccupied
                                ? 'bg-neutral-900/40 text-neutral-600 border border-neutral-900 cursor-not-allowed opacity-40'
                                : isSelected
                                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                                : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                            }`}
                          >
                            <span>{slot}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOccupied ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Contact Details & Coupon */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                        Seus Dados de Contato
                      </h4>
                      <div>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Seu Nome Completo *"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="WhatsApp para Confirmação *"
                          className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                        Cupom Promocional (Opcional)
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="EX: PRIMEIRA10"
                          className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs uppercase font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Aplicar
                        </button>
                      </div>

                      {appliedCoupon && (
                        <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
                          <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado!</span>
                          <span className="font-bold">
                            {appliedCoupon.discountType === 'percentage'
                              ? `-${appliedCoupon.discountValue}%`
                              : `-R$ ${appliedCoupon.discountValue}`}
                          </span>
                        </div>
                      )}

                      {couponError && (
                        <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                          {couponError}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary & Submit */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-neutral-400 block">Resumo do Horário:</span>
                      <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                        <span>{selectedService ? selectedService.name : 'Selecione o serviço'}</span>
                        <span className="text-amber-500">•</span>
                        <span>{selectedDate} às {selectedTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 block uppercase">Total a pagar:</span>
                        <span className="text-xl font-bold font-mono text-emerald-400">
                          R$ {calculateFinalPrice().toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirmar Horário</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ABA MEUS AGENDAMENTOS */}
        {/* ======================================================== */}
        {viewTab === 'meus-agendamentos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Meus Agendamentos</h2>
                <p className="text-xs text-neutral-400">
                  Consulte os seus cortes futuros e histórico na {tenant.name}
                </p>
              </div>

              <button
                onClick={() => setViewTab('agendar')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold cursor-pointer"
              >
                + Agendar Novo Horário
              </button>
            </div>

            {clientAppointments.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 text-center text-neutral-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
                <h3 className="text-base font-bold text-white mb-1">Nenhum agendamento encontrado</h3>
                <p className="text-xs text-neutral-500 mb-4">Você ainda não tem cortes registrados nesta barbearia.</p>
                <button
                  onClick={() => setViewTab('agendar')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold cursor-pointer"
                >
                  Agendar Meu Primeiro Corte
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{app.date} às {app.time}</span>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            app.status === 'Concluído'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : app.status === 'Cancelado'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">{app.serviceName}</h4>
                      <p className="text-xs text-neutral-400 mb-3">
                        Profissional: <strong className="text-neutral-200">{app.barberName}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        R$ {app.finalPrice.toFixed(2)}
                      </span>

                      {app.status === 'Confirmado' && (
                        <button
                          onClick={() => onCancelAppointment(app.id)}
                          className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Desmarcar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ABA CLUBE DE FIDELIDADE */}
        {/* ======================================================== */}
        {viewTab === 'fidelidade' && (
          <div className="space-y-6">
            {/* Loyalty Balance Card */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-neutral-950">
                    PROGRAMA DE PONTOS VIP
                  </span>
                  <h2 className="text-2xl font-bold font-display text-white mt-2">
                    Clube de Vantagens {tenant.name}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                    Cada serviço realizado acumula pontos que podem ser trocados por cortes gratuitos, produtos e descontos no balcão.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800 text-center shrink-0">
                  <span className="text-[11px] text-neutral-400 block mb-0.5">Seu Saldo Atual</span>
                  <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-400">
                    {clientUser ? clientUser.loyaltyPoints : 85}
                  </span>
                  <span className="text-[11px] text-neutral-500 block">pontos disponíveis</span>
                </div>
              </div>
            </div>

            {/* Rewards catalog */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Recompensas Que Você Pode Resgatar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rewardsList.map((reward) => {
                  const points = clientUser ? clientUser.loyaltyPoints : 85;
                  const canClaim = points >= reward.pointsCost;

                  return (
                    <div
                      key={reward.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                            {reward.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {reward.pointsCost} pts
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{reward.title}</h4>
                        <p className="text-xs text-neutral-400">{reward.description}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-neutral-800">
                        <span
                          className={`text-[11px] font-semibold block text-center py-1.5 rounded-lg ${
                            canClaim
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                              : 'bg-neutral-950 text-neutral-500'
                          }`}
                        >
                          {canClaim ? '✓ Disponível para resgatar' : `Faltam ${reward.pointsCost - points} pts`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
