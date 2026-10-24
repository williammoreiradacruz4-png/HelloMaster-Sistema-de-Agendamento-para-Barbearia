/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import {
  COLLECTIONS,
  subscribeToCollection,
  saveDocument,
  deleteDocument,
  resetDatabaseToCleanState,
} from './firebase';
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

const getInitialBarberParam = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('barber');
  }
  return null;
};

export default function App() {
  const initialBarber = getInitialBarberParam();

  // Se entrou pelo QR Code / link direto com ?barber=slug, abre DIRETO o cadastro da barbearia
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    initialBarber ? 'register-client' : 'splash'
  );
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentTenantId, setCurrentTenantId] = useState<string>('shop-1');
  const [targetBarberSlug, setTargetBarberSlug] = useState<string | null>(initialBarber);

  // Core cloud/database state
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [tenants, setTenants] = useState<BarberTenant[]>(INITIAL_TENANTS);
  const [staff, setStaff] = useState<BarberStaff[]>(INITIAL_STAFF);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [rewards, setRewards] = useState<LoyaltyReward[]>(INITIAL_REWARDS);
  const [coupons, setCoupons] = useState<PromoCoupon[]>(INITIAL_COUPONS);
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [messageLogs, setMessageLogs] = useState<WhatsAppMessageLog[]>(INITIAL_MESSAGE_LOGS);

  // Firestore Real-time Multi-Device Synchronization (Computer <-> Cellphone)
  useEffect(() => {
    const unsubTenants = subscribeToCollection<BarberTenant>(
      COLLECTIONS.TENANTS,
      (cloudTenants) => {
        setTenants(cloudTenants);
        if (cloudTenants.length > 0) {
          setCurrentTenantId((prev) => {
            if (targetBarberSlug) {
              const matched = cloudTenants.find(
                (t) => t.slug.toLowerCase() === targetBarberSlug.toLowerCase() || t.id === targetBarberSlug
              );
              if (matched) return matched.id;
            }
            if (!prev || !cloudTenants.some((t) => t.id === prev)) {
              return cloudTenants[0].id;
            }
            return prev;
          });
        }
      }
    );

    const unsubStaff = subscribeToCollection<BarberStaff>(
      COLLECTIONS.STAFF,
      (cloudStaff) => {
        setStaff(cloudStaff);
      }
    );

    const unsubServices = subscribeToCollection<ServiceItem>(
      COLLECTIONS.SERVICES,
      (cloudServices) => {
        setServices(cloudServices);
      }
    );

    const unsubAppointments = subscribeToCollection<Appointment>(
      COLLECTIONS.APPOINTMENTS,
      (cloudAppointments) => {
        // Ordena por data e hora decrescente
        const sorted = [...cloudAppointments].sort((a, b) => {
          const dtA = `${a.date} ${a.time}`;
          const dtB = `${b.date} ${b.time}`;
          return dtB.localeCompare(dtA);
        });
        setAppointments(sorted);
      }
    );

    const unsubClients = subscribeToCollection<ClientRecord>(
      COLLECTIONS.CLIENTS,
      (cloudClients) => {
        setClients(cloudClients);
      }
    );

    const unsubRewards = subscribeToCollection<LoyaltyReward>(
      COLLECTIONS.REWARDS,
      (cloudRewards) => {
        setRewards(cloudRewards);
      }
    );

    const unsubCoupons = subscribeToCollection<PromoCoupon>(
      COLLECTIONS.COUPONS,
      (cloudCoupons) => {
        setCoupons(cloudCoupons);
      }
    );

    const unsubMessages = subscribeToCollection<WhatsAppMessageLog>(
      COLLECTIONS.MESSAGES,
      (cloudMessages) => {
        setMessageLogs(cloudMessages);
      }
    );

    const unsubUsers = subscribeToCollection<UserAccount>(
      COLLECTIONS.USERS,
      (cloudUsers) => {
        // Preserva o Master Admin fixo se não existir na nuvem
        const merged = [...INITIAL_USERS];
        cloudUsers.forEach((u) => {
          if (!merged.some((m) => m.id === u.id || m.email.toLowerCase() === u.email.toLowerCase())) {
            merged.push(u);
          }
        });
        setUsers(merged);
      }
    );

    return () => {
      unsubTenants();
      unsubStaff();
      unsubServices();
      unsubAppointments();
      unsubClients();
      unsubRewards();
      unsubCoupons();
      unsubMessages();
      unsubUsers();
    };
  }, [targetBarberSlug]);

  // Mapeia parâmetros da URL gerados pelo escaneamento do QR Code no celular
  useEffect(() => {
    const handleUrlCheck = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const barberSlug = urlParams.get('barber');

      if (barberSlug) {
        setTargetBarberSlug(barberSlug);
        setCurrentScreen('register-client');
      }
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  // Quando os dados das barbearias chegam da nuvem, vincula a barbearia correspondente
  useEffect(() => {
    if (targetBarberSlug && tenants.length > 0) {
      const targetShop = tenants.find(
        (s) =>
          s.slug.toLowerCase() === targetBarberSlug.toLowerCase() ||
          s.id === targetBarberSlug
      );
      if (targetShop) {
        setCurrentTenantId(targetShop.id);
        setCurrentScreen('register-client');
      }
    }
  }, [targetBarberSlug, tenants]);

  const handleTestClientLink = (slug: string) => {
    const targetShop = tenants.find((s) => s.slug === slug);
    if (targetShop) {
      window.history.pushState({}, '', `?barber=${slug}`);
      setTargetBarberSlug(slug);
      setCurrentTenantId(targetShop.id);
      setCurrentScreen('register-client');
    }
  };

  // Active tenant getter
  const activeTenant =
    tenants.find(
      (t) =>
        t.id === currentTenantId ||
        (targetBarberSlug && t.slug.toLowerCase() === targetBarberSlug.toLowerCase())
    ) || tenants[0];

  // Active client getter if client logged in
  const activeClient = currentUser
    ? clients.find(
        (c) =>
          c.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
          c.name === currentUser.name ||
          (currentUser.phone && c.phone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, ''))
      )
    : null;

  // Login handler
  const handleLogin = async (email: string, role: UserRole, tenantId?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      if (cleanEmail.endsWith('@barber.com') || cleanEmail.includes('@')) {
        matchedUser = {
          id: `user-${Date.now()}`,
          name: cleanEmail.split('@')[0],
          email: cleanEmail,
          role,
          tenantId: tenantId || currentTenantId || (tenants[0]?.id ?? 'shop-1'),
        };
        await saveDocument(COLLECTIONS.USERS, matchedUser.id, matchedUser);
      } else {
        alert('E-mail não identificado. Se você é cliente, cadastre-se usando o link abaixo ou o QR Code do estabelecimento.');
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
  const handleClientRegisterSuccess = async (newClient: ClientRecord) => {
    const shopId = activeTenant?.id || currentTenantId || tenants[0]?.id || 'shop-1';
    const cleanPhone = newClient.phone.replace(/\D/g, '') || newClient.phone;
    const clientEmail = newClient.email || `${cleanPhone}@barber.com`;

    const newCustomer: ClientRecord = {
      ...newClient,
      id: 'cst-' + Date.now(),
      tenantId: shopId,
      email: clientEmail,
      loyaltyPoints: 0,
    };

    // Salva cliente em tempo real no Firestore
    await saveDocument(COLLECTIONS.CLIENTS, newCustomer.id, newCustomer);

    // Salva conta de usuário correspondente
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newCustomer.name,
      email: clientEmail,
      role: 'client',
      phone: newCustomer.phone,
      tenantId: shopId,
    };
    await saveDocument(COLLECTIONS.USERS, newUser.id, newUser);

    // Conecta imediatamente o cliente cadastrado e abre a tela de agendamento da barbearia
    setCurrentUser(newUser);
    setCurrentTenantId(shopId);
    setCurrentScreen('client-portal');
  };

  // Master Admin Handlers
  const handleMasterAddTenant = async (newTenant: BarberTenant, _tempPass: string) => {
    // 1. Salva barbearia no Firestore
    await saveDocument(COLLECTIONS.TENANTS, newTenant.id, newTenant);

    // 2. Salva usuário administrador da barbearia
    const newTenantUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: newTenant.name,
      email: newTenant.email,
      role: 'tenant',
      phone: newTenant.phone,
      tenantId: newTenant.id,
    };
    await saveDocument(COLLECTIONS.USERS, newTenantUser.id, newTenantUser);

    // 3. Cadastra serviços padrão iniciais no Firestore
    const defaultServices: ServiceItem[] = [
      {
        id: `serv-${Date.now()}-1`,
        tenantId: newTenant.id,
        name: 'Corte Degradê / Fade',
        description: 'Corte contemporâneo com acabamento na navalha.',
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
        description: 'Alinhamento completo de barba com toalha aquecida e navalha.',
        durationMinutes: 30,
        price: 45,
        loyaltyPointsAwarded: 15,
        category: 'Barba',
        isActive: true,
      },
      {
        id: `serv-${Date.now()}-3`,
        tenantId: newTenant.id,
        name: 'Combo Cabelo + Barba',
        description: 'Pacote completo de corte degradê e barboterapia.',
        durationMinutes: 60,
        price: 90,
        loyaltyPointsAwarded: 35,
        category: 'Combo',
        isActive: true,
      },
    ];

    for (const serv of defaultServices) {
      await saveDocument(COLLECTIONS.SERVICES, serv.id, serv);
    }

    // 4. Cadastra barbeiro padrão inicial no Firestore
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
    await saveDocument(COLLECTIONS.STAFF, defaultStaff.id, defaultStaff);
  };

  const handleMasterToggleStatus = async (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    const newStatus = target.status === 'ativa' ? 'suspensa' : 'ativa';
    await saveDocument(COLLECTIONS.TENANTS, tenantId, {
      ...target,
      status: newStatus,
    });
  };

  const handleMasterDeleteTenant = async (tenantId: string) => {
    const tenantTarget = tenants.find((t) => t.id === tenantId);
    const tenantName = tenantTarget ? tenantTarget.name : 'Inquilino';

    // Remove do Firestore
    await deleteDocument(COLLECTIONS.TENANTS, tenantId);

    // Remove registros associados
    const tenantStaff = staff.filter((s) => s.tenantId === tenantId);
    for (const s of tenantStaff) await deleteDocument(COLLECTIONS.STAFF, s.id);

    const tenantServs = services.filter((s) => s.tenantId === tenantId);
    for (const sv of tenantServs) await deleteDocument(COLLECTIONS.SERVICES, sv.id);

    const tenantApps = appointments.filter((a) => a.tenantId === tenantId);
    for (const a of tenantApps) await deleteDocument(COLLECTIONS.APPOINTMENTS, a.id);

    const tenantCoups = coupons.filter((c) => c.tenantId === tenantId);
    for (const c of tenantCoups) await deleteDocument(COLLECTIONS.COUPONS, c.id);

    const tenantRews = rewards.filter((r) => r.tenantId === tenantId);
    for (const r of tenantRews) await deleteDocument(COLLECTIONS.REWARDS, r.id);

    if (currentTenantId === tenantId) {
      const remaining = tenants.filter((t) => t.id !== tenantId);
      if (remaining.length > 0) {
        setCurrentTenantId(remaining[0].id);
      }
    }

    alert(`Barbearia "${tenantName}" excluída com sucesso!`);
  };

  const handleMasterUpdateTenant = async (updated: BarberTenant) => {
    await saveDocument(COLLECTIONS.TENANTS, updated.id, updated);
    alert(`Barbearia "${updated.name}" atualizada com sucesso!`);
  };

  const handleMasterImpersonate = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    setCurrentScreen('admin-tenant');
  };

  // Tenant Admin Handlers
  const handleTenantAddStaff = async (newStaff: BarberStaff) => {
    await saveDocument(COLLECTIONS.STAFF, newStaff.id, newStaff);
  };

  const handleTenantPayCommission = async (staffId: string) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return;
    await saveDocument(COLLECTIONS.STAFF, staffId, {
      ...target,
      totalEarned: target.totalEarned + target.pendingPayout,
      pendingPayout: 0,
    });
  };

  const handleTenantAddService = async (newService: ServiceItem) => {
    await saveDocument(COLLECTIONS.SERVICES, newService.id, newService);
  };

  const handleTenantToggleService = async (serviceId: string) => {
    const target = services.find((s) => s.id === serviceId);
    if (!target) return;
    await saveDocument(COLLECTIONS.SERVICES, serviceId, {
      ...target,
      isActive: !target.isActive,
    });
  };

  const handleTenantAddReward = async (newReward: LoyaltyReward) => {
    await saveDocument(COLLECTIONS.REWARDS, newReward.id, newReward);
  };

  const handleTenantRedeemReward = async (clientId: string, rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    const client = clients.find((c) => c.id === clientId);
    if (!reward || !client) return;

    // Deduz pontos
    await saveDocument(COLLECTIONS.CLIENTS, clientId, {
      ...client,
      loyaltyPoints: Math.max(0, client.loyaltyPoints - reward.pointsCost),
    });

    // Incrementa contagem de resgates
    await saveDocument(COLLECTIONS.REWARDS, rewardId, {
      ...reward,
      claimedCount: reward.claimedCount + 1,
    });
  };

  const handleTenantAddCoupon = async (newCoupon: PromoCoupon) => {
    await saveDocument(COLLECTIONS.COUPONS, newCoupon.id, newCoupon);
  };

  const handleTenantToggleCoupon = async (code: string) => {
    const target = coupons.find((c) => c.code === code);
    if (!target) return;
    await saveDocument(COLLECTIONS.COUPONS, target.id, {
      ...target,
      isActive: !target.isActive,
    });
  };

  const handleTenantAddClient = async (newClient: ClientRecord) => {
    await saveDocument(COLLECTIONS.CLIENTS, newClient.id, newClient);
  };

  // Appointment handler - Multi-device Real-time write!
  const handleAddAppointment = async (newApp: Appointment) => {
    // 1. Salva no Firestore. O notebook da barbearia recebe instantaneamente via onSnapshot
    await saveDocument(COLLECTIONS.APPOINTMENTS, newApp.id, newApp);

    // 2. Registra notificação automática de confirmação no histórico WhatsApp
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
    await saveDocument(COLLECTIONS.MESSAGES, autoMsg.id, autoMsg);

    // 3. Cadastra ou atualiza o cliente na base
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
      await saveDocument(COLLECTIONS.CLIENTS, newCli.id, newCli);
    }
  };

  const handleSendMessage = async (newLog: WhatsAppMessageLog) => {
    await saveDocument(COLLECTIONS.MESSAGES, newLog.id, newLog);
  };

  const handleDeleteMessage = async (id: string) => {
    await deleteDocument(COLLECTIONS.MESSAGES, id);
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    const app = appointments.find((a) => a.id === id);
    if (!app) return;

    // Atualiza status no Firestore (sincroniza de volta para o celular)
    await saveDocument(COLLECTIONS.APPOINTMENTS, id, {
      ...app,
      status: newStatus,
    });

    if (newStatus === 'Concluído') {
      // 1. Credita comissão do barbeiro
      const staffMember = staff.find((s) => s.id === app.barberId);
      if (staffMember) {
        const commAmt = (app.finalPrice * staffMember.commissionRate) / 100;
        await saveDocument(COLLECTIONS.STAFF, app.barberId, {
          ...staffMember,
          completedCuts: staffMember.completedCuts + 1,
          pendingPayout: staffMember.pendingPayout + commAmt,
        });
      }

      // 2. Credita pontos de fidelidade do cliente
      const matchingClient = clients.find(
        (c) => c.phone.replace(/\D/g, '') === app.clientPhone.replace(/\D/g, '')
      );
      if (matchingClient) {
        const awardedPoints = app.finalPrice >= 80 ? 30 : 20;
        await saveDocument(COLLECTIONS.CLIENTS, matchingClient.id, {
          ...matchingClient,
          totalVisits: matchingClient.totalVisits + 1,
          totalSpent: matchingClient.totalSpent + app.finalPrice,
          loyaltyPoints: matchingClient.loyaltyPoints + awardedPoints,
          lastVisit: app.date,
        });
      }
    }
  };

  const handleUpdateTenantConfig = async (updated: Partial<BarberTenant>) => {
    const target = tenants.find((t) => t.id === currentTenantId);
    if (!target) return;
    await saveDocument(COLLECTIONS.TENANTS, currentTenantId, {
      ...target,
      ...updated,
    });
  };

  const handleOpenClientPortal = (slug: string) => {
    const found = tenants.find((t) => t.slug === slug);
    if (found) {
      setCurrentTenantId(found.id);
    }
    setCurrentScreen('client-portal');
  };

  // Reset/Limpeza total dos dados fictícios
  const handleResetDatabase = async () => {
    try {
      await resetDatabaseToCleanState();
      setTenants([]);
      setStaff([]);
      setServices([]);
      setAppointments([]);
      setClients([]);
      setRewards([]);
      setCoupons([]);
      setMessageLogs([]);
      alert('Todo o sistema e banco de dados foram reinicializados! Todos os dados fictícios foram excluídos com sucesso.');
    } catch (err) {
      console.error('Erro ao resetar banco:', err);
      alert('Ocorreu um erro ao resetar o banco de dados. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* 1ª TELA: SPLASH SCREEN (5 SEGUNDOS OU PULAR) */}
      {currentScreen === 'splash' && (
        <SplashScreen
          onFinish={() => {
            const barberParam = getInitialBarberParam();
            if (barberParam) {
              setCurrentScreen('register-client');
            } else {
              setCurrentScreen('login');
            }
          }}
        />
      )}

      {/* 2ª TELA: LOGIN E SELEÇÃO DE PERFIL */}
      {currentScreen === 'login' && (
        <LoginScreen
          tenants={tenants}
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register-client')}
          onNavigateToClientPortal={() => setCurrentScreen('client-portal')}
        />
      )}

      {/* TELA: CADASTRO DE CLIENTE EXCLUSIVO DA BARBEARIA */}
      {currentScreen === 'register-client' && (
        <ClientRegisterScreen
          tenantId={activeTenant?.id || currentTenantId}
          tenant={activeTenant}
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
          onResetDatabase={handleResetDatabase}
          onLogout={handleLogout}
        />
      )}

      {/* 4ª TELA: PAINEL DA BARBEARIA (TENANT / INQUILINO) */}
      {currentScreen === 'admin-tenant' && (
        <TenantAdminScreen
          tenant={activeTenant}
          allTenants={tenants}
          onSelectTenant={(id) => setCurrentTenantId(id)}
          staffList={staff.filter((s) => s.tenantId === currentTenantId)}
          onAddStaff={handleTenantAddStaff}
          onPayCommission={handleTenantPayCommission}
          servicesList={services.filter((s) => s.tenantId === currentTenantId)}
          onAddService={handleTenantAddService}
          onToggleService={handleTenantToggleService}
          rewardsList={rewards.filter((r) => r.tenantId === currentTenantId)}
          onAddReward={handleTenantAddReward}
          onRedeemReward={handleTenantRedeemReward}
          couponsList={coupons.filter((c) => c.tenantId === currentTenantId)}
          onAddCoupon={handleTenantAddCoupon}
          onToggleCoupon={handleTenantToggleCoupon}
          clientsList={clients.filter((c) => c.tenantId === currentTenantId)}
          onAddClient={handleTenantAddClient}
          appointments={appointments.filter((a) => a.tenantId === currentTenantId)}
          onAddAppointment={handleAddAppointment}
          onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          onUpdateTenantConfig={handleUpdateTenantConfig}
          onOpenClientPortal={handleOpenClientPortal}
          messageLogs={messageLogs.filter((m) => m.tenantId === currentTenantId)}
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
          staffList={staff.filter((s) => s.tenantId === currentTenantId)}
          servicesList={services.filter((s) => s.tenantId === currentTenantId && s.isActive)}
          rewardsList={rewards.filter((r) => r.tenantId === currentTenantId)}
          couponsList={coupons.filter((c) => c.tenantId === currentTenantId && c.isActive)}
          clientUser={activeClient}
          allTenantAppointments={appointments.filter((a) => a.tenantId === currentTenantId)}
          clientAppointments={appointments.filter((a) => {
            if (a.tenantId !== currentTenantId) return false;
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
