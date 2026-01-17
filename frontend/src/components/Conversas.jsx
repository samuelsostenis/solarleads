import React from 'react';
import { MessageCircle } from 'lucide-react';

const Conversas = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Histórico de Conversas</h2>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          Em desenvolvimento...
        </p>
      </div>
    </div>
  );
};

export default Conversas;
