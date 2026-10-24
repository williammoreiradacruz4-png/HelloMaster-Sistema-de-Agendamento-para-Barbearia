import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { BarberStaff } from '../types/barber';

interface NewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSave: (staff: BarberStaff) => void;
}

export const NewStaffModal: React.FC<NewStaffModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Barbeiro Especialista');
  const [phone, setPhone] = useState('');
  const [commissionRate, setCommissionRate] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: BarberStaff = {
      id: `staff-${Date.now()}`,
      tenantId,
      name: name.trim(),
      role: role.trim(),
      phone: phone.trim() || '(11) 98000-0000',
      commissionRate: Number(commissionRate) || 50,
      completedCuts: 0,
      totalEarned: 0,
      pendingPayout: 0,
      isActive: true,
    };

    onSave(newStaff);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-neutral-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cadastrar Funcionário</h3>
              <p className="text-xs text-neutral-400">Adicione barbeiro e comissão percentual</p>
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
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Nome Completo do Barbeiro *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matheus Navalha"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Especialidade / Cargo
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Barbeiro Master"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98000-0000"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-300">
                Taxa de Comissão (% por serviço)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {commissionRate}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>20% (Iniciante)</span>
              <span>50% (Padrão)</span>
              <span>80% (Sócio)</span>
            </div>
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
              <span>Salvar Barbeiro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
