import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  Search,
  Filter,
  Phone,
  Calendar,
  User,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Zap,
  Scissors
} from 'lucide-react';
import {
  BarberTenant,
  Appointment,
  ClientRecord,
  WhatsAppMessageLog,
  MessageNotificationType,
} from '../types/barber';

interface MessageHistoryTabProps {
  tenant: BarberTenant;
  appointments: Appointment[];
  clientsList: ClientRecord[];
  messageLogs: WhatsAppMessageLog[];
  onSendMessage: (newLog: WhatsAppMessageLog) => void;
  onDeleteMessage: (id: string) => void;
  onClearHistory?: () => void;
}

export const MessageHistoryTab: React.FC<MessageHistoryTabProps> = ({
  tenant,
  appointments,
  clientsList,
  messageLogs,
  onSendMessage,
  onDeleteMessage,
  onClearHistory,
}) => {
  // Form / Simulator State
  const [selectedType, setSelectedType] = useState<MessageNotificationType>('confirmacao_agendamento');
  const [selectedClientId, setSelectedClientId] = useState<string>('custom');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('none');
  const [customName, setCustomName] = useState('Lucas Rocha');
  const [customPhone, setCustomPhone] = useState('(11) 98877-6655');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessToast, setSendSuccessToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Preview target in WhatsApp device
  const [previewMessage, setPreviewMessage] = useState<string>('');
  const [previewClientName, setPreviewClientName] = useState<string>('Lucas Rocha');
  const [previewClientPhone, setPreviewClientPhone] = useState<string>('(11) 98877-6655');

  // Default templates generator
  const getTemplate = (
    type: MessageNotificationType,
    clientName: string,
    appointment?: Appointment
  ): string => {
    switch (type) {
      case 'confirmacao_agendamento': {
        const time = appointment ? appointment.time : '15:30';
        const service = appointment ? appointment.serviceName : 'Corte Degradê & Barboterapia';
        const barber = appointment ? appointment.barberName : 'Barbeiro Especialista';
        const date = appointment ? appointment.date : 'Hoje';
        return `💈 Olá ${clientName}! Seu agendamento na *${tenant.name}* está CONFIRMADO para ${date} às *${time}*.\n\n✂️ Serviço: ${service}\n👤 Profissional: ${barber}\n📍 Endereço: ${tenant.address}\n\nTe aguardamos! Caso precise remarcar, basta avisar por aqui.`;
      }
      case 'lembrete_retorno': {
        return `✂️ Fala ${clientName}, tudo bem? Notamos que já se passaram quase *25 dias* desde o seu último corte na *${tenant.name}*!\n\nSeu visual merece continuar alinhado na régua máxima. Que tal garantir seu horário para esta semana?\n\n📲 Agende online direto pelo link:\nhttps://barbersaas.com/${tenant.slug}`;
      }
      case 'lembrete_horario': {
        const time = appointment ? appointment.time : '14:00';
        return `⏰ Olá ${clientName}! Passando para lembrar que seu horário na *${tenant.name}* é *HOJE às ${time}*.\n\nPedimos que chegue com 5 minutinhos de antecedência para desfrutar de um bom café ☕. Até logo!`;
      }
      case 'fidelidade_premio': {
        return `🏆 Parabéns ${clientName}! Você completou sua cartela de 10 estrelas no programa de fidelidade da *${tenant.name}*!\n\nSeu corte ou benefício cortesia está liberado. Venha resgatar no seu próximo atendimento!`;
      }
      case 'personalizada':
      default:
        return `💈 Olá ${clientName}! Entramos em contato da *${tenant.name}* para informar sobre nossas novidades e horários disponíveis desta semana.`;
    }
  };

  // Sync template text when type or client changes
  React.useEffect(() => {
    let name = customName;
    let phone = customPhone;
    let matchedApp: Appointment | undefined = undefined;

    if (selectedClientId !== 'custom') {
      const foundClient = clientsList.find((c) => c.id === selectedClientId);
      if (foundClient) {
        name = foundClient.name;
        phone = foundClient.phone;
        setCustomName(name);
        setCustomPhone(phone);
      }
    }

    if (selectedAppointmentId !== 'none') {
      matchedApp = appointments.find((a) => a.id === selectedAppointmentId);
      if (matchedApp) {
        name = matchedApp.clientName;
        phone = matchedApp.clientPhone;
        setCustomName(name);
        setCustomPhone(phone);
      }
    }

    const generated = getTemplate(selectedType, name, matchedApp);
    setMessageContent(generated);
    setPreviewMessage(generated);
    setPreviewClientName(name);
    setPreviewClientPhone(phone);
  }, [selectedType, selectedClientId, selectedAppointmentId, clientsList, appointments, tenant.name, tenant.slug, tenant.address]);

  // Handle client selection change
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId !== 'custom') {
      const c = clientsList.find((cli) => cli.id === clientId);
      if (c) {
        setCustomName(c.name);
        setCustomPhone(c.phone);
        const text = getTemplate(selectedType, c.name);
        setMessageContent(text);
        setPreviewMessage(text);
        setPreviewClientName(c.name);
        setPreviewClientPhone(c.phone);
      }
    }
  };

  // Handle appointment selection change
  const handleAppointmentSelect = (appId: string) => {
    setSelectedAppointmentId(appId);
    if (appId !== 'none') {
      const a = appointments.find((app) => app.id === appId);
      if (a) {
        setCustomName(a.clientName);
        setCustomPhone(a.clientPhone);
        const text = getTemplate(selectedType, a.clientName, a);
        setMessageContent(text);
        setPreviewMessage(text);
        setPreviewClientName(a.clientName);
        setPreviewClientPhone(a.clientPhone);
      }
    }
  };

  // Handle user manual editing of text
  const handleTextChange = (val: string) => {
    setMessageContent(val);
    setPreviewMessage(val);
  };

  // Simulate Sending
  const handleSimulateSend = () => {
    if (!customName.trim() || !customPhone.trim() || !messageContent.trim()) {
      alert('Preencha o nome do cliente, telefone e a mensagem a ser enviada.');
      return;
    }

    setIsSending(true);

    // Realistic delivery progression
    setTimeout(() => {
      const now = new Date();
      const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const newLog: WhatsAppMessageLog = {
        id: `msg-${Date.now()}`,
        tenantId: tenant.id,
        clientName: customName.trim(),
        clientPhone: customPhone.trim(),
        type: selectedType,
        messageText: messageContent.trim(),
        sentAt: `${dateFormatted} ${timeFormatted}`,
        status: 'lida', // Blue double checkmarks
        simulated: true,
        appointmentId: selectedAppointmentId !== 'none' ? selectedAppointmentId : undefined,
      };

      onSendMessage(newLog);
      setIsSending(false);

      const labelType =
        selectedType === 'confirmacao_agendamento'
          ? 'Confirmação de Agendamento'
          : selectedType === 'lembrete_retorno'
          ? 'Lembrete de Retorno'
          : selectedType === 'lembrete_horario'
          ? 'Lembrete de Horário'
          : selectedType === 'fidelidade_premio'
          ? 'Prêmio Fidelidade'
          : 'Mensagem';

      setSendSuccessToast(`Notificação (${labelType}) enviada com sucesso para ${customName} (${customPhone})! ✓✓`);
      setTimeout(() => setSendSuccessToast(null), 4000);
    }, 1200);
  };

  // Open Real WhatsApp
  const handleOpenRealWhatsApp = () => {
    const cleanPhone = customPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(messageContent);
    const url = `https://wa.me/55${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Quick batch return reminder simulation
  const handleBatchReturnReminders = () => {
    const targetClients = clientsList.slice(0, 3);
    if (targetClients.length === 0) {
      alert('Nenhum cliente cadastrado na lista para disparar lembretes.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const now = new Date();
      const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      targetClients.forEach((client, idx) => {
        const text = getTemplate('lembrete_retorno', client.name);
        const log: WhatsAppMessageLog = {
          id: `msg-batch-${Date.now()}-${idx}`,
          tenantId: tenant.id,
          clientName: client.name,
          clientPhone: client.phone,
          type: 'lembrete_retorno',
          messageText: text,
          sentAt: `${dateFormatted} ${timeFormatted}`,
          status: 'lida',
          simulated: true,
        };
        onSendMessage(log);
      });

      setIsSending(false);
      setSendSuccessToast(`Lembretes de retorno disparados com sucesso para ${targetClients.length} clientes da carteira! ✓✓`);
      setTimeout(() => setSendSuccessToast(null), 4000);
    }, 1500);
  };

  // Filter message logs
  const filteredLogs = messageLogs
    .filter((log) => log.tenantId === tenant.id)
    .filter((log) => {
      if (filterType !== 'all' && log.type !== filterType) return false;
      if (filterStatus !== 'all' && log.status !== filterStatus) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          log.clientName.toLowerCase().includes(term) ||
          log.clientPhone.toLowerCase().includes(term) ||
          log.messageText.toLowerCase().includes(term)
        );
      }
      return true;
    });

  // Calculate statistics
  const tenantLogs = messageLogs.filter((log) => log.tenantId === tenant.id);
  const totalSent = tenantLogs.length;
  const confirmationsCount = tenantLogs.filter((l) => l.type === 'confirmacao_agendamento').length;
  const returnRemindersCount = tenantLogs.filter((l) => l.type === 'lembrete_retorno').length;
  const readCount = tenantLogs.filter((l) => l.status === 'lida').length;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Toast de Sucesso */}
      {sendSuccessToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-slide-up border border-emerald-400">
          <CheckCheck className="w-4 h-4 text-white" />
          <span>{sendSuccessToast}</span>
        </div>
      )}

      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Histórico de Mensagens & Notificações WhatsApp
              </h2>
              <p className="text-xs text-neutral-400">
                Simulador oficial de envio de confirmação de agendamentos e lembretes de retorno para clientes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchReturnReminders}
            disabled={isSending}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm hover:border-amber-400"
            title="Dispara lembretes para clientes sem visita há mais de 20 dias"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Disparar Lembretes de Retorno em Massa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Total Notificações Enviadas</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalSent}
          </div>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>100% de taxa de envio simulada</span>
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Confirmações de Agendamento</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            {confirmationsCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Avisos de horário e profissional
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Lembretes de Retorno (25 dias)</span>
            <Scissors className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {returnRemindersCount}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Reativação ativa de clientes da barbearia
          </span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-xs font-medium">Mensagens Lidas (Tiques Azuis)</span>
            <CheckCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
            {readCount} <span className="text-xs font-normal text-neutral-400">({totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 100}%)</span>
          </div>
          <span className="text-[11px] text-blue-400/80 mt-1 block">
            Entregues no WhatsApp do cliente
          </span>
        </div>
      </div>

      {/* SIMULADOR WHATSAPP & FORMULÁRIO DE DISPARO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Configuração do Disparo (7 colunas) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Simulador de Envio WhatsApp</h3>
            </div>
            <span className="text-[11px] text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
              Disparo Imediato
            </span>
          </div>

          {/* Tipo de Notificação */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Tipo de Notificação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType('confirmacao_agendamento')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  selectedType === 'confirmacao_agendamento'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="block font-bold">🗓️ Confirmação</span>
                <span className="text-[10px] opacity-75">Horário e Barbeiro</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('lembrete_retorno')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  selectedType === 'lembrete_retorno'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="block font-bold">✂️ Lembrete Retorno</span>
                <span className="text-[10px] opacity-75">Pós 25 dias de corte</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('lembrete_horario')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  selectedType === 'lembrete_horario'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="block font-bold">⏰ Lembrete Hoje</span>
                <span className="text-[10px] opacity-75">Chegada com 5min</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('fidelidade_premio')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  selectedType === 'fidelidade_premio'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="block font-bold">🏆 Prêmio Fidelidade</span>
                <span className="text-[10px] opacity-75">Cartela Completa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('personalizada')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer col-span-2 sm:col-span-1 ${
                  selectedType === 'personalizada'
                    ? 'bg-neutral-800 border-neutral-600 text-white shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="block font-bold">✍️ Personalizada</span>
                <span className="text-[10px] opacity-75">Texto livre</span>
              </button>
            </div>
          </div>

          {/* Vínculo com Agendamento ou Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Puxar de um Agendamento
              </label>
              <select
                value={selectedAppointmentId}
                onChange={(e) => handleAppointmentSelect(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="none">-- Selecionar Agendamento --</option>
                {appointments
                  .filter((a) => a.tenantId === tenant.id)
                  .map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.time} - {app.clientName} ({app.serviceName})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Ou Selecionar Cliente da Base
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="custom">Digitação Manual / Outro</option>
                {clientsList
                  .filter((c) => c.tenantId === tenant.id)
                  .map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.name} - {cli.phone}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Destinatário (Nome e Telefone) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Nome do Cliente
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setPreviewClientName(e.target.value);
                  }}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                WhatsApp com DDD
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => {
                    setCustomPhone(e.target.value);
                    setPreviewClientPhone(e.target.value);
                  }}
                  placeholder="(11) 98888-1234"
                  className="w-full pl-8 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Conteúdo da Mensagem */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Texto da Notificação WhatsApp
              </label>
              <span className="text-[10px] text-neutral-500">
                Suporta formatação *negrito* do WhatsApp
              </span>
            </div>
            <textarea
              rows={5}
              value={messageContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Digite a mensagem..."
              className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(messageContent);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenRealWhatsApp}
                className="px-3 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-emerald-400 border border-emerald-900/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Abre o aplicativo oficial do WhatsApp Web com a mensagem preenchida"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir no WhatsApp Real</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSimulateSend}
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enviando Mensagem...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Simular Disparo Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Painel Direito: Preview Realista do Smartphone WhatsApp (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start">
          <div className="w-full max-w-sm bg-neutral-900 rounded-3xl p-3 border-2 border-neutral-700 shadow-2xl relative">
            {/* Speaker bar top */}
            <div className="w-20 h-3 bg-neutral-800 rounded-full mx-auto mb-2" />

            {/* Smartphone Inner Screen */}
            <div className="bg-[#0b141a] rounded-2xl overflow-hidden border border-neutral-800 text-neutral-100 flex flex-col h-[460px]">
              {/* WhatsApp App Header Bar */}
              <div className="bg-[#1f2c34] p-3 flex items-center justify-between border-b border-[#2a3942] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    {previewClientName.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {previewClientName || 'Cliente'}
                    </h4>
                    <span className="text-[10px] text-emerald-400 block leading-none">
                      online
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-neutral-400 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-mono text-sm leading-none">⋮</span>
                </div>
              </div>

              {/* Chat Area with WhatsApp Pattern Style */}
              <div
                className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end"
                style={{
                  backgroundImage: 'radial-gradient(#1f2c34 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Date bubble */}
                <div className="mx-auto bg-[#182229] px-2.5 py-0.5 rounded-md text-[10px] text-neutral-400 font-medium">
                  HOJE
                </div>

                {/* Incoming / System notice */}
                <div className="bg-[#182229]/90 border border-[#2a3942] rounded-lg p-2 text-[10px] text-neutral-300 text-center">
                  🔒 Mensagens protegidas por criptografia de ponta a ponta simulada da barbearia.
                </div>

                {/* Outgoing Message Bubble (Right) */}
                <div className="self-end max-w-[90%] bg-[#005c4b] text-neutral-100 rounded-2xl rounded-tr-xs p-3 shadow-md text-xs leading-relaxed space-y-1 relative">
                  <div className="whitespace-pre-wrap font-sans text-[11px]">
                    {previewMessage || 'Sua mensagem aparecerá aqui em tempo real...'}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/80 pt-0.5">
                    <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>

              {/* WhatsApp bottom input mockup */}
              <div className="bg-[#1f2c34] p-2 flex items-center gap-2 border-t border-[#2a3942] shrink-0">
                <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-neutral-400 truncate">
                  Mensagem
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-neutral-500 mt-2 font-medium">
              📱 Prévia de renderização no WhatsApp do cliente
            </p>
          </div>
        </div>
      </div>

      {/* TABELA DE HISTÓRICO DE MENSAGENS DISPARADAS */}
      <div className="bg-white rounded-2xl shadow-xl p-6 text-gray-900 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-gray-200 gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Registro de Notificações Enviadas ({filteredLogs.length})</span>
            </h3>
            <p className="text-xs text-gray-500">
              Histórico completo de confirmações de agendamento e lembretes de retorno gerados
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Filtro por Tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">Todos os Tipos</option>
              <option value="confirmacao_agendamento">Confirmação de Agendamento</option>
              <option value="lembrete_retorno">Lembrete de Retorno</option>
              <option value="lembrete_horario">Lembrete de Horário</option>
              <option value="fidelidade_premio">Prêmio Fidelidade</option>
            </select>

            {/* Busca por cliente */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-[11px] uppercase text-gray-600 font-semibold">
                <th className="p-3">Data / Hora</th>
                <th className="p-3">Cliente / Telefone</th>
                <th className="p-3">Tipo de Notificação</th>
                <th className="p-3">Conteúdo da Mensagem</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Nenhum registro de mensagem encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const cleanPhone = log.clientPhone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(log.messageText)}`;

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors align-top">
                      {/* Data / Hora */}
                      <td className="p-3 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{log.sentAt}</span>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900 block">{log.clientName}</span>
                        <span className="text-[11px] font-mono text-gray-500">{log.clientPhone}</span>
                      </td>

                      {/* Tipo */}
                      <td className="p-3 whitespace-nowrap">
                        {log.type === 'confirmacao_agendamento' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <span>🗓️ Confirmação</span>
                          </span>
                        ) : log.type === 'lembrete_retorno' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <span>✂️ Lembrete Retorno</span>
                          </span>
                        ) : log.type === 'lembrete_horario' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 inline-flex items-center gap-1">
                            <span>⏰ Lembrete Horário</span>
                          </span>
                        ) : log.type === 'fidelidade_premio' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                            <span>🏆 Prêmio Fidelidade</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            Mensagem
                          </span>
                        )}
                      </td>

                      {/* Conteúdo */}
                      <td className="p-3 max-w-md">
                        <p className="line-clamp-2 text-xs text-gray-700 font-sans leading-relaxed">
                          {log.messageText}
                        </p>
                      </td>

                      {/* Status com Tiques */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                          <span>Lida (Azul)</span>
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomName(log.clientName);
                              setCustomPhone(log.clientPhone);
                              setMessageContent(log.messageText);
                              setPreviewMessage(log.messageText);
                              setPreviewClientName(log.clientName);
                              setPreviewClientPhone(log.clientPhone);
                              setSelectedType(log.type);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium transition-colors cursor-pointer"
                            title="Carregar no simulador"
                          >
                            Ver no Chat
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            title="Abrir conversa no WhatsApp Web"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteMessage(log.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remover do histórico"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
