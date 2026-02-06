'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi, CreateUserRequest, UpdateUserRequest } from '@/lib/api/users.api';
import { User, UserRole } from '@/types';

type ModalMode = 'create' | 'edit' | null;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.PARTICIPANT as UserRole,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.findAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setForm({ firstName: '', lastName: '', email: '', password: '', role: UserRole.PARTICIPANT });
    setEditingUser(null);
    setModalMode('create');
  };

  const openEditModal = (user: User) => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    setEditingUser(user);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        const payload: CreateUserRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
        };
        await usersApi.create(payload);
        toast.success('Utilisateur créé');
      } else if (modalMode === 'edit' && editingUser) {
        const payload: UpdateUserRequest = {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          role: form.role,
        };
        // Only send password if it was filled in
        if (form.password) {
          payload.password = form.password;
        }
        await usersApi.update(editingUser.id, payload);
        toast.success('Utilisateur modifié');
      }
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ?`)) return;
    try {
      await usersApi.delete(user.id);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const roleBadge = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        Participant
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des utilisateurs
        </h1>
        <button
          onClick={openCreateModal}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-gray-500">Aucun utilisateur.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Nom</th>
                <th className="px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 font-medium text-gray-700">Rôle</th>
                <th className="px-4 py-3 font-medium text-gray-700">Inscrit le</th>
                <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">{roleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe {modalMode === 'edit' && '(laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="input-field"
                >
                  <option value={UserRole.PARTICIPANT}>Participant</option>
                  <option value={UserRole.ADMIN}>Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
