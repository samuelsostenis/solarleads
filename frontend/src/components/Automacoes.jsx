import React from 'react';
import { Zap } from 'lucide-react';

const Automacoes = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Automações</h2>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-8">
          <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          Configure fluxos de automação aqui
        </p>
      </div>
    </div>
  );
};

export default Automacoes;
