import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Send, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/useToast';

const WhatsAppPanel = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const { addToast } = useToast();

  const fetchStatus = async () => {
    try {
      const response = await api.get('/messages/whatsapp-status');
      setStatus(response.data);
      if (response.data.whatsapp?.qr) {
        setQrCode(response.data.whatsapp.qr);
      } else if (response.data.whatsapp?.isConnected) {
        setQrCode(null);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
      setStatus({ error: 'WhatsApp Service não disponível' });
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!phone || !message) {
      addToast('Preencha telefone e mensagem', 'error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/messages/send', { phone, message });
      addToast('Mensagem enviada com sucesso!', 'success');
      setPhone('');
      setMessage('');
    } catch (error) {
      addToast(error.response?.data?.error || 'Erro ao enviar mensagem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">WhatsApp Bot</h2>
      
      {/* Status Card */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Status WhatsApp
          </h3>
          <button
            onClick={fetchStatus}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {status?.whatsapp?.isConnected ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Conectado</span>
            </div>
          ) : status?.error ? (
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">{status.error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-medium">Aguardando conexão...</span>
            </div>
          )}

          {qrCode && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Escaneie o QR Code com WhatsApp:</p>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                alt="QR Code WhatsApp"
                className="mx-auto border-4 border-gray-700 rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Send Message Card */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="font-bold mb-4">Enviar Mensagem</h3>
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Telefone (com DDI)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999999999"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || !status?.whatsapp?.isConnected}
            />
            <p className="text-xs text-gray-500 mt-1">Exemplo: 5511999999999 (Brasil)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || !status?.whatsapp?.isConnected}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !status?.whatsapp?.isConnected}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Mensagem
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppPanel;
