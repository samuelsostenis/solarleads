import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../lib/useToast';
import { useAuth } from '../lib/useAuth';

const Automacoes = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    trigger_type: 'no_response',
    trigger_config: { delay_hours: 24 },
    action_type: 'send_message',
    action_config: { message: '' },
    status: 'active'
  });

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/automations');
      setAutomations(response.data.automations || []);
    } catch (error) {
      console.error('Erro ao buscar automações:', error);
      addToast('Erro ao carregar automações', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingAutomation) {
        await api.put(`/automations/${editingAutomation.id}`, formData);
        addToast('Automação atualizada!', 'success');
      } else {
        await api.post('/automations', formData);
        addToast('Automação criada!', 'success');
      }
      fetchAutomations();
      setShowModal(false);
      resetForm();
    } catch (error) {
      addToast(error.response?.data?.error || 'Erro ao salvar automação', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente deletar esta automação?')) return;
    try {
      await api.delete(`/automations/${id}`);
      addToast('Automação deletada!', 'success');
      fetchAutomations();
    } catch (error) {
      addToast('Erro ao deletar automação', 'error');
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/automations/${id}/toggle`);
      addToast('Status alterado!', 'success');
      fetchAutomations();
    } catch (error) {
      addToast('Erro ao alterar status', 'error');
    }
  };

  const openEditModal = (automation) => {
    setEditingAutomation(automation);
    setFormData({
      name: automation.name,
      trigger_type: automation.trigger_type,
      trigger_config: automation.trigger_config || { delay_hours: 24 },
      action_type: automation.action_type,
      action_config: automation.action_config || { message: '' },
      status: automation.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAutomation(null);
    setFormData({
      name: '',
      trigger_type: 'no_response',
      trigger_config: { delay_hours: 24 },
      action_type: 'send_message',
      action_config: { message: '' },
      status: 'active'
    });
  };

  const triggerTypes = [
    { value: 'no_response', label: 'Sem resposta do cliente' },
    { value: 'lead_created', label: 'Novo lead criado' },
    { value: 'status_changed', label: 'Status alterado' },
    { value: 'time_based', label: 'Baseado em tempo' }
  ];

  const actionTypes = [
    { value: 'send_message', label: 'Enviar mensagem WhatsApp' },
    { value: 'update_status', label: 'Atualizar status do lead' },
    { value: 'assign_user', label: 'Atribuir a usuário' },
    { value: 'send_email', label: 'Enviar e-mail' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Automações</h2>
        {user?.role === 'admin' && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Automação
          </button>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Carregando...</p>
        ) : automations.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            Nenhuma automação configurada
          </p>
        ) : (
          <div className="space-y-4">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {auto.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Gatilho: {triggerTypes.find(t => t.value === auto.trigger_type)?.label}
                  </p>
                  <p className="text-sm text-gray-400">
                    Ação: {actionTypes.find(a => a.value === auto.action_type)?.label}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                    auto.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {auto.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(auto.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title={auto.status === 'active' ? 'Desativar' : 'Ativar'}
                    >
                      {auto.status === 'active' ? (
                        <Power className="w-5 h-5 text-green-500" />
                      ) : (
                        <PowerOff className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(auto)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(auto.id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingAutomation ? 'Editar Automação' : 'Nova Automação'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gatilho</label>
                <select
                  value={formData.trigger_type}
                  onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  {triggerTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.trigger_type === 'no_response' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Horas sem resposta</label>
                  <input
                    type="number"
                    value={formData.trigger_config.delay_hours || 24}
                    onChange={(e) => setFormData({
                      ...formData,
                      trigger_config: { delay_hours: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Ação</label>
                <select
                  value={formData.action_type}
                  onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  {actionTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.action_type === 'send_message' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <textarea
                    value={formData.action_config.message || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      action_config: { message: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg"
                    rows="4"
                    placeholder="Digite a mensagem que será enviada..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Automacoes;
