import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, PhoneCall, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/useToast';

const Conversas = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, [searchQuery]);

  useEffect(() => {
    if (selectedPhone) {
      fetchMessages(selectedPhone);
    }
  }, [selectedPhone]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages', {
        params: {
          phone: searchQuery,
          limit: 100
        }
      });
      
      // Agrupar mensagens por telefone
      const grouped = response.data.messages.reduce((acc, msg) => {
        if (!acc[msg.phone]) {
          acc[msg.phone] = {
            phone: msg.phone,
            lastMessage: msg.message,
            lastDate: msg.created_at,
            count: 1
          };
        } else {
          acc[msg.phone].count++;
          if (new Date(msg.created_at) > new Date(acc[msg.phone].lastDate)) {
            acc[msg.phone].lastMessage = msg.message;
            acc[msg.phone].lastDate = msg.created_at;
          }
        }
        return acc;
      }, {});

      setConversations(Object.values(grouped).sort((a, b) => 
        new Date(b.lastDate) - new Date(a.lastDate)
      ));
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      addToast('Erro ao carregar conversas', 'error');
    }
  };

  const fetchMessages = async (phone) => {
    setLoading(true);
    try {
      const response = await api.get(`/messages/conversation/${phone}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      addToast('Erro ao carregar mensagens', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Histórico de Conversas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Conversas */}
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar por telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                Nenhuma conversa encontrada
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.phone}
                  onClick={() => setSelectedPhone(conv.phone)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPhone === conv.phone
                      ? 'bg-blue-600'
                      : 'bg-gray-900 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" />
                      {conv.phone}
                    </span>
                    <span className="text-xs text-gray-400">{conv.count}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(conv.lastDate)}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {selectedPhone ? `Conversa com ${selectedPhone}` : 'Selecione uma conversa'}
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {loading ? (
              <p className="text-gray-400 text-center py-8">Carregando mensagens...</p>
            ) : !selectedPhone ? (
              <p className="text-gray-400 text-center py-8">
                Selecione uma conversa para ver as mensagens
              </p>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma mensagem encontrada</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.direction === 'outbound'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.direction === 'outbound' ? (
                        <ArrowUpCircle className="w-4 h-4" />
                      ) : (
                        <ArrowDownCircle className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {msg.direction === 'outbound' ? 'Enviada' : 'Recebida'}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs opacity-75 mt-1">{formatDate(msg.created_at)}</p>
                    <span className="text-xs opacity-75">
                      {msg.status === 'delivered' ? '✓✓' : msg.status === 'sent' ? '✓' : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversas;
