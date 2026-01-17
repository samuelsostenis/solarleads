import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../lib/useAuth';
import { useToast } from '../lib/useToast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (e) {
      console.error('Erro ao buscar usuários', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toast = useToast();

  const changeRole = async (id, role) => {
    try {
      await api.put(`/users/${id}/role`, { role });
      toast.addToast('Role atualizada', 'success');
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.addToast('Erro ao atualizar role', 'error');
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm('Deletar usuário?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.addToast('Usuário deletado', 'success');
      fetchUsers();
    } catch (e) {
      console.error(e);
      toast.addToast('Erro ao deletar usuário', 'error');
    }
  };

  if (!auth.user || auth.user.role !== 'admin') return <div className="p-6">Acesso negado</div>;

  // pagination client-side
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(users.length / perPage));
  const visible = users.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Gerenciar Usuários</h2>
      {loading ? <div>Carregando...</div> : (
        <>
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(u => (
              <tr key={u.id} className="border-t border-gray-700">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.name || '-'}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')} className="px-2 py-1 bg-blue-600 rounded text-sm">Toggle Role</button>
                  <button onClick={() => removeUser(u.id)} className="px-2 py-1 bg-red-600 rounded text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">Página {page} de {totalPages}</div>
          <div className="space-x-2">
            <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="px-3 py-1 bg-gray-700 rounded">Anterior</button>
            <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="px-3 py-1 bg-gray-700 rounded">Próxima</button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
