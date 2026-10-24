import {
  BarberTenant,
  BarberStaff,
  ServiceItem,
  LoyaltyReward,
  PromoCoupon,
  ClientRecord,
  Appointment,
  UserAccount,
  WhatsAppMessageLog,
} from '../types/barber';

import barberInteriorImg from '../assets/images/barbershop_interior_1791312515543.jpg';
import barberSpecialistImg from '../assets/images/barber_specialist_1791312527207.jpg';

export { barberInteriorImg, barberSpecialistImg };

export function generateOperatingHours(): string[] {
  const hours: string[] = [];
  // Turno da Manhã (07:00 até 11:30)
  for (let h = 7; h <= 11; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
    hours.push(`${String(h).padStart(2, '0')}:30`);
  }
  // Turno da Tarde/Noite (13:00 até 20:00)
  for (let h = 13; h <= 19; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
    hours.push(`${String(h).padStart(2, '0')}:30`);
  }
  hours.push("20:00");
  return hours;
}

// Apenas o usuário Master Admin inicial para acesso ao sistema limpo
export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-master-main',
    name: 'Admin Geral do SaaS',
    email: 'admin@master.com',
    role: 'master',
    phone: '(11) 98888-0000',
  },
  {
    id: 'user-master-backup',
    name: 'Admin SaaS Master',
    email: 'admin@barbersaas.com',
    role: 'master',
    phone: '(11) 98888-0000',
  },
];

// Dados fictícios limpos e zerados conforme solicitação do usuário
export const INITIAL_TENANTS: BarberTenant[] = [];
export const INITIAL_STAFF: BarberStaff[] = [];
export const INITIAL_SERVICES: ServiceItem[] = [];
export const INITIAL_REWARDS: LoyaltyReward[] = [];
export const INITIAL_COUPONS: PromoCoupon[] = [];
export const INITIAL_CLIENTS: ClientRecord[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_MESSAGE_LOGS: WhatsAppMessageLog[] = [];
