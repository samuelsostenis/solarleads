import React from 'react';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

const Dashboard = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Leads',
      value: stats?.total_leads || 0,
      icon: Users,
      color: 'yellow',
      change: '+12%'
    },
    {
      title: 'Leads Hoje',
      value: stats?.leads_hoje || 0,
      icon: TrendingUp,
      color: 'green',
      change: '+5%'
    },
    {
      title: 'Qualificados',
      value: stats?.qualificados || 0,
      icon: Activity,
      color: 'blue',
      change: '+8%'
    },
    {
      title: 'Taxa de Conversão',
      value: `${stats?.taxa_conversao || 0}%`,
      icon: DollarSign,
      color: 'purple',
      change: '+2.5%'
    }
  ];

  const colorClasses = {
    yellow: 'from-yellow-500 to-orange-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[card.color]}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400">{card.change}</span>
              </div>
              <h3 className="text-gray-400 text-sm mb-2">{card.title}</h3>
              <p className="text-3xl font-bold text-white">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Gráfico Placeholder */}
      <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4">Leads nos Últimos 7 Dias</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Gráfico em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
