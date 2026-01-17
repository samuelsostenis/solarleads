import React from 'react';
import { Webhook } from 'lucide-react';

const Webhooks = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Webhooks</h2>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <p className="text-gray-400 text-center py-8">
          <Webhook className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          Configure integrações via webhook
        </p>
      </div>
    </div>
  );
};

export default Webhooks;
