import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Loader2, X, Check, UserCheck, UserX, Mail, Phone, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import type { Client, ConnectionRequest } from '../../types';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
    fetchConnectionRequests();
  }, []);

  async function fetchClients() {
    try {
      const res = await api.get<Client[]>('/clients');
      setClients(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function fetchConnectionRequests() {
    try {
      const res = await api.get<ConnectionRequest[]>('/connection-requests');
      setConnectionRequests(res.data);
    } catch {
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    try {
      await api.post('/clients/invite', inviteForm);
      setInviteForm({ firstName: '', lastName: '', phoneNumber: '' });
      setShowInvite(false);
      await fetchClients();
    } catch (err: any) {
      setInviteError(err.response?.data?.message ?? t('coach.dashboard.failedInvite'));
    } finally {
      setInviting(false);
    }
  }

  async function handleReview(requestId: string, accept: boolean) {
    setReviewingId(requestId);
    try {
      await api.put(`/connection-requests/${requestId}/${accept ? 'accept' : 'reject'}`);
      setConnectionRequests((prev) => prev.filter((r) => r.id !== requestId));
      if (accept) await fetchClients();
    } catch {
    } finally {
      setReviewingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Connection Requests */}
      {connectionRequests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-bold text-gray-900">{t('coach.dashboard.connectionRequests')}</h2>
            <span className="inline-flex items-center justify-center h-6 min-w-[1.5rem] px-1.5 rounded-full bg-teal-500 text-white text-xs font-bold">
              {connectionRequests.length}
            </span>
          </div>
          <div className="space-y-3">
            {connectionRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-teal-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-sm shrink-0">
                    {req.firstName[0]}{req.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {req.firstName} {req.lastName}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {req.phoneNumber}
                      </span>
                      {req.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {req.email}
                        </span>
                      )}
                    </div>
                    {req.message && (
                      <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
                        <span>{req.message}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 justify-end">
                  <button
                    onClick={() => handleReview(req.id, false)}
                    disabled={reviewingId === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {reviewingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                    {t('coach.dashboard.decline')}
                  </button>
                  <button
                    onClick={() => handleReview(req.id, true)}
                    disabled={reviewingId === req.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-500 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
                  >
                    {reviewingId === req.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                    {t('coach.dashboard.accept')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('coach.dashboard.yourClients')}</h1>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 transition-colors"
        >
          {showInvite ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {showInvite ? t('common.cancel') : t('coach.dashboard.inviteClient')}
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="mb-6 rounded-xl border border-teal-200 bg-teal-50/50 p-5 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">{t('coach.dashboard.inviteNew')}</h2>
          {inviteError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{inviteError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.firstName')}</label>
              <input
                required
                type="text"
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.lastName')}</label>
              <input
                required
                type="text"
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phoneNumber')}</label>
            <input
              required
              type="tel"
              value={inviteForm.phoneNumber}
              onChange={(e) => setInviteForm({ ...inviteForm, phoneNumber: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:opacity-50 transition-colors"
          >
            {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('coach.dashboard.sendInvitation')}
          </button>
        </form>
      )}

      {/* Client list */}
      {clients.length === 0 && connectionRequests.length === 0 ? (
        <div className="text-center py-20">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('coach.dashboard.noClients')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('coach.dashboard.noClientsDesc')}
          </p>
        </div>
      ) : clients.length > 0 ? (
        <div className="space-y-3">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => navigate(`/coach/clients/${client.id}`)}
              className="w-full flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all text-left"
            >
              <div className="h-12 w-12 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{client.firstName} {client.lastName}</p>
                <p className="text-xs text-gray-400">{t('coach.dashboard.lastWorkout')}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <Check className="h-4 w-4 text-teal-500" />
              </div>
            </button>
          ))}

          <button
            onClick={() => navigate('/coach/programs/new')}
            className="w-full rounded-xl bg-[#1B2A4A] px-4 py-3 text-sm font-medium text-white hover:bg-[#243660] transition-colors"
          >
            {t('coach.dashboard.createProgram')}
          </button>
        </div>
      ) : null}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1B2A4A]">{clients.length}</p>
          <p className="text-xs text-gray-400">{t('coach.dashboard.clients')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1B2A4A]">24</p>
          <p className="text-xs text-gray-400">{t('coach.dashboard.thisWeek')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#1B2A4A]">58</p>
          <p className="text-xs text-gray-400">{t('coach.dashboard.weightLogs')}</p>
        </div>
      </div>
    </div>
  );
}
