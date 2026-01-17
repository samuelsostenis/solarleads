import React from 'react';
import { TrendingUp } from 'lucide-react';

const Campanhas = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Campanhas</h2>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-green-500" />
          Gerencie suas campanhas de marketing
        </p>
      </div>
    </div>
  );
};

export default Campanhas;
