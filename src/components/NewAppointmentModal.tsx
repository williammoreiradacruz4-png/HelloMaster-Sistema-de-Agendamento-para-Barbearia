import React, { useState } from 'react';
import { X, Calendar, Clock, User, Scissors, DollarSign, Check } from 'lucide-react';
import { BarberStaff, ServiceItem, Appointment, ClientRecord } from '../types/barber';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  staffList: BarberStaff[];
  servicesList: ServiceItem[];
  clientsList: ClientRecord[];
  onSave: (appointment: Appointment) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  staffList,
  servicesList,
  clientsList,
  onSave,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceId, setServiceId] = useState(servicesList[0]?.id || '');
  const [barberId, setBarberId] = useState(staffList[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');

  if (!isOpen) return null;

  const selectedService = servicesList.find((s) => s.id === serviceId) || servicesList[0];
  const selectedBarber = staffList.find((b) => b.id === barberId) || staffList[0];

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    if (!cid) return;
    const found = clientsList.find((c) => c.id === cid);
    if (found) {
      setClientName(found.name);
      setClientPhone(found.phone);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !selectedService || !selectedBarber) return;

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      tenantId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '(11) 99999-0000',
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      date,
      time,
      durationMinutes: selectedService.durationMinutes,
      price: selectedService.price,
      finalPrice: selectedService.price,
      status: 'Confirmado',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onSave(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-neutral-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Novo Agendamento Manual</h3>
              <p className="text-xs text-neutral-400">Marque diretamente na agenda da barbearia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick client select */}
          {clientsList.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Selecionar Cliente Cadastrado (Opcional)
              </label>
              <select
                onChange={handleClientSelect}
                defaultValue=""
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Escolher da base ou digitar abaixo --</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.loyaltyPoints} pts
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Gabriel Lima"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(11) 98888-0000"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Serviço *
              </label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {servicesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R$ {s.price} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Barbeiro Responsável *
              </label>
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              >
                {staffList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Data do Atendimento
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Horário
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs flex items-center justify-between">
            <span className="text-neutral-400">Total a ser cobrado:</span>
            <span className="text-amber-400 font-bold font-mono text-sm">
              R$ {selectedService ? selectedService.price.toFixed(2) : '0,00'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
