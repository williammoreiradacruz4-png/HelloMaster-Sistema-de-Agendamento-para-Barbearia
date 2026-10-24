/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarberTenant,
  BarberStaff,
  ServiceItem,
  LoyaltyReward,
  PromoCoupon,
  ClientRecord,
  Appointment,
  UserAccount,
  UserRole,
  AppointmentStatus,
  WhatsAppMessageLog,
} from './types/barber';
import {
  INITIAL_USERS,
  INITIAL_TENANTS,
  INITIAL_STAFF,
  INITIAL_SERVICES,
  INITIAL_REWARDS,
  INITIAL_COUPONS,
  INITIAL_CLIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_MESSAGE_LOGS,
} from './data/mockData';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { ClientRegisterScreen } from './components/ClientRegisterScreen';
import { MasterAdminScreen } from './components/MasterAdminScreen';
import { TenantAdminScreen } from './components/TenantAdminScreen';
import { ClientPortalScreen } from './components/ClientPortalScreen';

export type AppScreen =
  | 'splash'
  | 'login'
  | 'register-client'
  | 'admin-master'
  | 'admin-tenant'
  | 'client-portal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string>('shop-1');

  // Core database state
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [tenants, setTenants] = useState<BarberTenant[]>(INITIAL_TENANTS);
  const [staff, setStaff] = useState<BarberStaff[]>(INITIAL_STAFF);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [rewards, setRewards] = useState<LoyaltyReward[]>(INITIAL_REWARDS);
  const [coupons, setCoupons] = useState<PromoCoupon[]>(INITIAL_COUPONS);
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [messageLogs, setMessageLogs] = useState<WhatsAppMessageLog[]>(INITIAL_MESSAGE_LOGS);

  // Mapeia parâmetros da URL gerados pelo escaneamento do QR Code
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const barberSlug = urlParams.get('barber');

    if (barberSlug) {
      const targetShop = tenants.find((s) => s.slug === barberSlug);
      if (targetShop) {
        setCurrentTenantId(targetShop.id);
        alert(`Acessando a área exclusiva da ${targetShop.name}. Crie seu cadastro de cliente para prosseguir.`);
        setCurrentScreen('register-client');
      } else {
        alert('Link de QR Code inválido ou Barbearia não localizada em nossa base.');
        setCurrentScreen('login');
      }
    }
  }, [tenants]);

  const handleTestClientLink = (slug: string) => {
    const targetShop = tenants.find((s) => s.slug === slug);
    if (targetShop) {
      window.history.pushState({}, '', `?barber=${slug}`);
      setCurrentTenantId(targetShop.id);
      alert(`Acessando a área exclusiva da ${targetShop.name}. Crie seu cadastro de cliente para prosseguir.`);
      setCurrentScreen('register-client');
    }
  };

  // Active tenant getter
  const activeTenant =
    tenants.find((t) => t.id === currentTenantId) || tenants[0];

  // Active client getter if client logged in
  const activeClient = currentUser
    ? clients.find((c) => c.email?.toLowerCase() === currentUser.email?.toLowerCase() || c.name === currentUser.name)
    : null;

  // Login handler
  const handleLogin = (email: string, role: UserRole, tenantId?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      if (cleanEmail.endsWith('@barber.com') || cleanEmail.includes('@')) {
        matchedUser = {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role,
          tenantId: tenantId || currentTenantId || 'shop-1',
        };
        setUsers((prev) => [...prev, matchedUser!]);
      } else {
        alert("E-mail não identificado. Se você é cliente, cadastre-se usando o link abaixo ou o QR Code do estabelecimento.");
        return;
      }
    }

    setCurrentUser(matchedUser);

    if (matchedUser.role === 'master') {
      setCurrentScreen('admin-master');
    } else if (matchedUser.role === 'tenant') {
      if (matchedUser.tenantId) {
        setCurrentTenantId(matchedUser.tenantId);
      }
      setCurrentScreen('admin-tenant');
    } else {
      // Customer
      const customerData = clients.find(
        (c) => c.email?.toLowerCase() === cleanEmail || c.id === matchedUser?.id
      );
      if (customerData) {
        setCurrentTenantId(customerData.tenantId);
      }
      setCurrentScreen('client-portal');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  // Client Registration handler
  const handleClientRegisterSuccess = (newClient: ClientRecord) => {
    const shopId = currentTenantId || 'tenant-1';
    const cleanPhone = newClient.phone.replace(/\D/g, '') || newClient.phone;
    const clientEmail = `${cleanPhone}@barber.com`;

    // Corrigido: O cliente agora inicia estritamente com ZERO (0) pontos
    const newCustomer: ClientRecord = {
      ...newClient,
      id: "cst-" + Date.now(),
      tenantId: shopId,
      email: clientEmail,
      loyaltyPoints: 0, // Estritamente 0 pontos
    };

    setClients((prev) => [newCustomer, ...prev]);

    // Create user account in users
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newCustomer.name,
      email: clientEmail,
      role: 'client',
      phone: newCustomer.phone,
      tenantId: shopId,
    };
    setUsers((prev) => [...prev, newUser]);

    // Redireciona para o login conforme especificado: showScreen('screen-login')
    setCurrentScreen('login');
  };

  // Master Admin Handlers
  const handleMasterAddTenant = (newTenant: BarberTenant, tempPass: string) => {
    setTenants((prev) => [newTenant, ...prev]);

    // Create tenant admin user
    const newTenantUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newTenant.name,
      email: newTenant.email,
      role: 'tenant',
      phone: newTenant.phone,
      tenantId: newTenant.id,
    };
    setUsers((prev) => [...prev, newTenantUser]);

    // Seed initial basic services for this new tenant
    const defaultServices: ServiceItem[] = [
      {
        id: `serv-${Date.now()}-1`,
        tenantId: newTenant.id,
        name: 'Corte Degradê / Fade',
        description: 'Corte contemporâneo navalhado.',
        durationMinutes: 40,
        price: 55,
        loyaltyPointsAwarded: 20,
        category: 'Cabelo',
        isActive: true,
      },
      {
        id: `serv-${Date.now()}-2`,
        tenantId: newTenant.id,
        name: 'Barboterapia Toalha Quente',
        description: 'Barba alinhada com toalha aquecida e navalha.',
        durationMinutes: 30,
        price: 45,
        loyaltyPointsAwarded: 15,
        category: 'Barba',
        isActive: true,
      },
    ];
    setServices((prev) => [...prev, ...defaultServices]);

    // Seed default staff
    const defaultStaff: BarberStaff = {
      id: `staff-${Date.now()}`,
      tenantId: newTenant.id,
      name: `${newTenant.name.split(' ')[0]} Master`,
      role: 'Barbeiro Principal',
      phone: newTenant.phone,
      commissionRate: 50,
      completedCuts: 0,
      totalEarned: 0,
      pendingPayout: 0,
      isActive: true,
    };
    setStaff((prev) => [...prev, defaultStaff]);
  };

  const handleMasterToggleStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            status: t.status === 'ativa' ? 'suspensa' : 'ativa',
          };
        }
        return t;
      })
    );
  };

  const handleMasterDeleteTenant = (tenantId: string) => {
    const tenantTarget = tenants.find((t) => t.id === tenantId);
    const tenantName = tenantTarget ? tenantTarget.name : 'Inquilino';

    // Remove inquilino e todos os dados associados
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    setUsers((prev) => prev.filter((u) => u.tenantId !== tenantId));
    setStaff((prev) => prev.filter((s) => s.tenantId !== tenantId));
    setServices((prev) => prev.filter((s) => s.tenantId !== tenantId));
    setAppointments((prev) => prev.filter((a) => a.tenantId !== tenantId));
    setCoupons((prev) => prev.filter((c) => c.tenantId !== tenantId));
    setRewards((prev) => prev.filter((r) => r.tenantId !== tenantId));

    if (currentTenantId === tenantId) {
      const remaining = tenants.filter((t) => t.id !== tenantId);
      if (remaining.length > 0) {
        setCurrentTenantId(remaining[0].id);
      }
    }

    alert(`Barbearia "${tenantName}" excluída com sucesso!`);
  };

  const handleMasterUpdateTenant = (updated: BarberTenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setUsers((prev) =>
      prev.map((u) => {
        if (u.tenantId === updated.id) {
          return {
            ...u,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
          };
        }
        return u;
      })
    );
    alert(`Barbearia "${updated.name}" atualizada com sucesso!`);
  };

  const handleMasterImpersonate = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setCurrentScreen('admin-tenant');
  };

  // Tenant Admin Handlers
  const handleTenantAddStaff = (newStaff: BarberStaff) => {
    setStaff((prev) => [...prev, newStaff]);
  };

  const handleTenantPayCommission = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            totalEarned: s.totalEarned + s.pendingPayout,
            pendingPayout: 0,
          };
        }
        return s;
      })
    );
  };

  const handleTenantAddService = (newService: ServiceItem) => {
    setServices((prev) => [...prev, newService]);
  };

  const handleTenantToggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleTenantAddReward = (newReward: LoyaltyReward) => {
    setRewards((prev) => [...prev, newReward]);
  };

  const handleTenantRedeemReward = (clientId: string, rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;

    // Deduct points
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            loyaltyPoints: Math.max(0, c.loyaltyPoints - reward.pointsCost),
          };
        }
        return c;
      })
    );

    // Increment claimed count
    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, claimedCount: r.claimedCount + 1 } : r))
    );
  };

  const handleTenantAddCoupon = (newCoupon: PromoCoupon) => {
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const handleTenantToggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleTenantAddClient = (newClient: ClientRecord) => {
    setClients((prev) => [...prev, newClient]);
  };

  const handleAddAppointment = (newApp: Appointment) => {
    setAppointments((prev) => [newApp, ...prev]);

    // Registra notificação automática de confirmação de agendamento no histórico WhatsApp
    const autoMsg: WhatsAppMessageLog = {
      id: `msg-auto-${Date.now()}`,
      tenantId: newApp.tenantId,
      clientName: newApp.clientName,
      clientPhone: newApp.clientPhone,
      type: 'confirmacao_agendamento',
      messageText: `💈 Olá ${newApp.clientName}! Seu agendamento foi CONFIRMADO com sucesso para ${newApp.date} às ${newApp.time} (${newApp.serviceName} com o profissional ${newApp.barberName}). Te esperamos!`,
      sentAt: `${newApp.date} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'lida',
      simulated: true,
      appointmentId: newApp.id,
    };
    setMessageLogs((prev) => [autoMsg, ...prev]);

    // Check if client exists in client list, otherwise create
    const existing = clients.find(
      (c) => c.phone.replace(/\D/g, '') === newApp.clientPhone.replace(/\D/g, '')
    );
    if (!existing) {
      const newCli: ClientRecord = {
        id: `cli-${Date.now()}`,
        tenantId: newApp.tenantId,
        name: newApp.clientName,
        phone: newApp.clientPhone,
        loyaltyPoints: 10,
        totalVisits: 1,
        totalSpent: newApp.finalPrice,
        lastVisit: newApp.date,
      };
      setClients((prev) => [...prev, newCli]);
    }
  };

  const handleSendMessage = (newLog: WhatsAppMessageLog) => {
    setMessageLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteMessage = (id: string) => {
    setMessageLogs((prev) => prev.filter((m) => m.id !== id));
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, status: newStatus };
        }
        return a;
      })
    );

    const app = appointments.find((a) => a.id === id);
    if (app && newStatus === 'Concluído') {
      // 1. Credit barber staff commission and count
      const staffMember = staff.find((s) => s.id === app.barberId);
      if (staffMember) {
        const commAmt = (app.finalPrice * staffMember.commissionRate) / 100;
        setStaff((prev) =>
          prev.map((s) => {
            if (s.id === app.barberId) {
              return {
                ...s,
                completedCuts: s.completedCuts + 1,
                pendingPayout: s.pendingPayout + commAmt,
              };
            }
            return s;
          })
        );
      }

      // 2. Credit client loyalty points and spend
      const matchingClient = clients.find(
        (c) => c.phone.replace(/\D/g, '') === app.clientPhone.replace(/\D/g, '')
      );
      if (matchingClient) {
        const awardedPoints = app.finalPrice >= 80 ? 30 : 20;
        setClients((prev) =>
          prev.map((c) => {
            if (c.id === matchingClient.id) {
              return {
                ...c,
                totalVisits: c.totalVisits + 1,
                totalSpent: c.totalSpent + app.finalPrice,
                loyaltyPoints: c.loyaltyPoints + awardedPoints,
                lastVisit: app.date,
              };
            }
            return c;
          })
        );
      }
    }
  };

  const handleUpdateTenantConfig = (updated: Partial<BarberTenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenantId ? { ...t, ...updated } : t))
    );
  };

  const handleOpenClientPortal = (slug: string) => {
    const found = tenants.find((t) => t.slug === slug);
    if (found) {
      setCurrentTenantId(found.id);
    }
    setCurrentScreen('client-portal');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* 1ª TELA: SPLASH SCREEN (5 SEGUNDOS OU PULAR) */}
      {currentScreen === 'splash' && (
        <SplashScreen onFinish={() => setCurrentScreen('login')} />
      )}

      {/* 2ª TELA: LOGIN E SELEÇÃO DE PERFIL */}
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register-client')}
          onNavigateToClientPortal={() => setCurrentScreen('client-portal')}
        />
      )}

      {/* TELA: CADASTRO DE CLIENTE */}
      {currentScreen === 'register-client' && (
        <ClientRegisterScreen
          tenantId={currentTenantId}
          onSuccess={handleClientRegisterSuccess}
          onBackToLogin={() => setCurrentScreen('login')}
        />
      )}

      {/* 3ª TELA: ADMINISTRADOR GERAL (MASTER SAAS) */}
      {currentScreen === 'admin-master' && (
        <MasterAdminScreen
          tenants={tenants}
          onAddTenant={handleMasterAddTenant}
          onToggleStatus={handleMasterToggleStatus}
          onDeleteTenant={handleMasterDeleteTenant}
          onUpdateTenant={handleMasterUpdateTenant}
          onImpersonateTenant={handleMasterImpersonate}
          onTestClientLink={handleTestClientLink}
          onLogout={handleLogout}
        />
      )}

      {/* 4ª TELA: PAINEL DA BARBEARIA (TENANT / INQUILINO) */}
      {currentScreen === 'admin-tenant' && (
        <TenantAdminScreen
          tenant={activeTenant}
          allTenants={tenants}
          onSelectTenant={(id) => setCurrentTenantId(id)}
          staffList={
            staff.filter((s) => s.tenantId === currentTenantId).length > 0
              ? staff.filter((s) => s.tenantId === currentTenantId)
              : staff.filter((s) => s.tenantId === 'shop-1')
          }
          onAddStaff={handleTenantAddStaff}
          onPayCommission={handleTenantPayCommission}
          servicesList={
            services.filter((s) => s.tenantId === currentTenantId).length > 0
              ? services.filter((s) => s.tenantId === currentTenantId)
              : services.filter((s) => s.tenantId === 'shop-1')
          }
          onAddService={handleTenantAddService}
          onToggleService={handleTenantToggleService}
          rewardsList={
            rewards.filter((r) => r.tenantId === currentTenantId).length > 0
              ? rewards.filter((r) => r.tenantId === currentTenantId)
              : rewards.filter((r) => r.tenantId === 'shop-1')
          }
          onAddReward={handleTenantAddReward}
          onRedeemReward={handleTenantRedeemReward}
          couponsList={
            coupons.filter((c) => c.tenantId === currentTenantId).length > 0
              ? coupons.filter((c) => c.tenantId === currentTenantId)
              : coupons.filter((c) => c.tenantId === 'shop-1')
          }
          onAddCoupon={handleTenantAddCoupon}
          onToggleCoupon={handleTenantToggleCoupon}
          clientsList={clients.filter((c) => c.tenantId === currentTenantId || c.tenantId === 'shop-1')}
          onAddClient={handleTenantAddClient}
          appointments={appointments.filter((a) => a.tenantId === currentTenantId || a.tenantId === 'shop-1')}
          onAddAppointment={handleAddAppointment}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onUpdateTenantConfig={handleUpdateTenantConfig}
          onOpenClientPortal={handleOpenClientPortal}
          messageLogs={messageLogs}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onLogout={handleLogout}
        />
      )}

      {/* 5ª TELA: PORTAL DE AGENDAMENTO DO CLIENTE */}
      {currentScreen === 'client-portal' && (
        <ClientPortalScreen
          tenant={activeTenant}
          allTenants={tenants}
          onSelectTenant={(id) => setCurrentTenantId(id)}
          staffList={
            staff.filter((s) => s.tenantId === currentTenantId).length > 0
              ? staff.filter((s) => s.tenantId === currentTenantId)
              : staff.filter((s) => s.tenantId === 'shop-1')
          }
          servicesList={
            services.filter((s) => s.tenantId === currentTenantId && s.isActive).length > 0
              ? services.filter((s) => s.tenantId === currentTenantId && s.isActive)
              : services.filter((s) => s.tenantId === 'shop-1' && s.isActive)
          }
          rewardsList={
            rewards.filter((r) => r.tenantId === currentTenantId).length > 0
              ? rewards.filter((r) => r.tenantId === currentTenantId)
              : rewards.filter((r) => r.tenantId === 'shop-1')
          }
          couponsList={
            coupons.filter((c) => c.tenantId === currentTenantId && c.isActive).length > 0
              ? coupons.filter((c) => c.tenantId === currentTenantId && c.isActive)
              : coupons.filter((c) => c.tenantId === 'shop-1' && c.isActive)
          }
          clientUser={activeClient}
          allTenantAppointments={appointments.filter((a) => a.tenantId === currentTenantId || a.tenantId === 'shop-1')}
          clientAppointments={appointments.filter((a) => {
            if (a.tenantId !== currentTenantId && a.tenantId !== 'shop-1') return false;
            if (activeClient) {
              return (
                a.clientId === activeClient.id ||
                a.clientPhone.replace(/\D/g, '') === activeClient.phone.replace(/\D/g, '')
              );
            }
            return true;
          })}
          onBookAppointment={handleAddAppointment}
          onCancelAppointment={(id) => handleUpdateAppointmentStatus(id, 'Cancelado')}
          onBackToLogin={() => setCurrentScreen('login')}
        />
      )}
    </div>
  );
}
