import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

const WhatsAppPanel = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">WhatsApp Bot</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="font-bold mb-4">Conversas Ativas</h3>
          <p className="text-gray-400 text-center py-8">Em desenvolvimento...</p>
        </div>
        <div className="lg:col-span-2 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="font-bold mb-4 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Chat</span>
          </h3>
          <p className="text-gray-400 text-center py-8">Selecione uma conversa</p>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPanel;
