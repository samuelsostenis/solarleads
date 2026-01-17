import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/useAuth';
import RequireAuth from './components/RequireAuth';
import api from './lib/api';
import { ToastProvider } from './lib/useToast';

// Import components
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import WhatsAppPanel from './components/WhatsAppPanel';
import LeadsTable from './components/LeadsTable';
import Conversas from './components/Conversas';
import Automacoes from './components/Automacoes';
import Campanhas from './components/Campanhas';
import Webhooks from './components/Webhooks';
import Login from './components/Login';
import Register from './components/Register';
import AdminUsers from './components/AdminUsers';

const InnerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'leads', label: 'Leads' },
    { id: 'conversas', label: 'Conversas' },
    { id: 'automacoes', label: 'Automações' },
    { id: 'campanhas', label: 'Campanhas' },
    { id: 'webhooks', label: 'Webhooks' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} loading={loading} />;
      case 'pipeline':
        return <Pipeline />;
      case 'whatsapp':
        return <WhatsAppPanel />;
      case 'leads':
        return <LeadsTable />;
      case 'conversas':
        return <Conversas />;
      case 'automacoes':
        return <Automacoes />;
      case 'campanhas':
        return <Campanhas />;
      case 'webhooks':
        return <Webhooks />;
      default:
        return <Dashboard stats={stats} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">SolarLeads</h1>
            </div>
            <div className="flex items-center space-x-4">
              {auth.user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm">
                    <div>{auth.user.email}</div>
                    <div className="text-xs text-gray-400">{auth.user.role}</div>
                  </div>
                  {auth.user.role === 'admin' && (
                    <Link to="/admin/users" className="text-sm text-gray-300">Users</Link>
                  )}
                  <button onClick={auth.logout} className="text-sm text-gray-300">Sair</button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link to="/login" className="text-sm text-gray-300">Entrar</Link>
                  <Link to="/register" className="text-sm text-gray-300">Registrar</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-gray-800/30 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-yellow-400' : 'text-gray-400'}`}>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-gray-800/30 backdrop-blur-md border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-400 text-sm">SolarLeads v1.0</p>
        </div>
      </footer>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RequireAuth><InnerApp /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth><AdminUsers /></RequireAuth>} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
);

export default App;
