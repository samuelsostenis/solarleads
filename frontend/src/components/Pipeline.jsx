import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get(`${API_URL}/pipeline/deals`);
      setDeals(response.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { id: 'new', label: 'Novos', color: 'blue' },
    { id: 'contacted', label: 'Contatados', color: 'yellow' },
    { id: 'qualified', label: 'Qualificados', color: 'green' },
    { id: 'proposal', label: 'Proposta', color: 'purple' },
    { id: 'negotiation', label: 'Negociação', color: 'orange' },
    { id: 'closed_won', label: 'Ganhos', color: 'emerald' },
  ];

  const getDealsByStage = (stageId) => {
    return deals.filter(deal => deal.status === stageId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Pipeline de Vendas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          return (
            <div key={stage.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{stage.label}</h3>
                <span className={`px-2 py-1 rounded-full text-xs bg-${stage.color}-500/20 text-${stage.color}-400`}>
                  {stageDeals.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <div 
                    key={deal.id}
                    className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    <p className="font-semibold text-sm">{deal.name || 'Sem nome'}</p>
                    <p className="text-xs text-gray-400">{deal.phone}</p>
                    {deal.valor_conta && (
                      <p className="text-xs text-green-400 mt-1">R$ {deal.valor_conta}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
