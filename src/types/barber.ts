export type UserRole = 'master' | 'tenant' | 'client';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  tenantId?: string; // If tenant admin or linked client
}

export interface BarberTenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  status: 'ativa' | 'teste' | 'suspensa';
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
  monthlyRevenue: number;
  totalAppointments: number;
  // Customization
  themeColor: 'amber' | 'emerald' | 'blue' | 'rose' | 'slate';
  slogan: string;
  address: string;
  bairro: string;
  city: string;
  state: string;
  openingHours: string;
  pixKey?: string;
  logoLetter?: string;
  coverImage?: string;
}

export interface BarberStaff {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  phone: string;
  commissionRate: number; // e.g. 50%
  completedCuts: number;
  totalEarned: number;
  pendingPayout: number;
  avatarUrl?: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  loyaltyPointsAwarded: number;
  category: 'Cabelo' | 'Barba' | 'Combo' | 'Estética';
  isActive: boolean;
}

export interface LoyaltyReward {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'Desconto' | 'Serviço' | 'Produto';
  claimedCount: number;
}

export interface PromoCoupon {
  id: string;
  tenantId: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend?: number;
  usageCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface ClientRecord {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  cep?: string;
  address?: string;
  bairro?: string;
  city?: string;
  state?: string;
  loyaltyPoints: number;
  fidelityPoints?: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
}

export type AppointmentStatus = 'Confirmado' | 'Concluído' | 'Cancelado' | 'Pendente';

export interface Appointment {
  id: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  clientId?: string;
  serviceId: string;
  serviceName: string;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  price: number;
  finalPrice: number;
  couponCode?: string;
  status: AppointmentStatus;
  createdAt: string;
}
