import React, { useState } from 'react';
import { MessageSquare, Send, X, Copy, Check } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientPhone: string;
  defaultMessage: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  clientName,
  clientPhone,
  defaultMessage,
}) => {
  const [message, setMessage] = useState(defaultMessage);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = clientPhone.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/55${cleanPhone}?text=${encodedMsg}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative text-neutral-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notificar Cliente via WhatsApp</h3>
              <p className="text-xs text-neutral-400">Cliente: {clientName} ({clientPhone})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Mensagem Pronta
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
            Dica: Ao clicar em &quot;Abrir WhatsApp&quot;, você será redirecionado para a conversa oficial com o texto preenchido.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp Web / App</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
