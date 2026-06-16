import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  getOfficerStats,
  createOfficer,
  toggleOfficerActive,
  reassignOfficerWard,
} from '../../api/complaints';
import { getWards } from '../../api/complaints';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';

const AdminOfficers = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['officer-stats'],
    queryFn:  getOfficerStats,
  });

  const { data: wardsData } = useQuery({
    queryKey: ['wards'],
    queryFn:  getWards,
  });

  const officers = data?.officers || [];
  const wards    = wardsData?.wards || [];

  const toggleMutation = useMutation({
    mutationFn: toggleOfficerActive,
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries(['officer-stats']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const wardMutation = useMutation({
    mutationFn: ({ id, wardId }) => reassignOfficerWard(id, wardId),
    onSuccess: () => {
      toast.success('Ward reassigned');
      queryClient.invalidateQueries(['officer-stats']);
      queryClient.invalidateQueries(['ward-stats']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Officers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage ward officers and their performance
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
          + Add Officer
        </button>
      </div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Officers</p>
            <p className="text-2xl font-bold text-slate-900">{officers.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-600">
              {officers.filter(o => o.isActive).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Unassigned</p>
            <p className="text-2xl font-bold text-amber-600">
              {officers.filter(o => !o.ward).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-violet-600">
              {(() => {
                const rated = officers.filter(o => o.avgRating);
                if (!rated.length) return '—';
                return (rated.reduce((s, o) => s + o.avgRating, 0) / rated.length).toFixed(1) + ' ⭐';
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Officers list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : officers.length === 0 ? (
        <EmptyState
          icon="👮"
          title="No officers yet"
          description="Add your first ward officer to start assigning complaints"
          action={
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
              + Add Officer
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {officers.map(officer => (
            <div key={officer._id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center text-base font-bold text-violet-700 flex-shrink-0">
                  {officer.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{officer.name}</p>
                      <p className="text-xs text-slate-400">{officer.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
                      officer.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {officer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div>
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-sm font-bold text-slate-700">{officer.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Pending</p>
                      <p className="text-sm font-bold text-amber-600">{officer.pending}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Resolved</p>
                      <p className="text-sm font-bold text-emerald-600">{officer.resolved}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Rating</p>
                      <p className="text-sm font-bold text-violet-600">
                        {officer.avgRating ? `${officer.avgRating} ⭐` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Ward + actions */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <select
                      className="input text-xs w-auto py-1.5"
                      value={officer.ward?._id || ''}
                      onChange={e => wardMutation.mutate({
                        id: officer._id,
                        wardId: e.target.value || null,
                      })}
                    >
                      <option value="">— No ward —</option>
                      {wards.map(w => (
                        <option key={w._id} value={w._id}>
                          Ward {w.wardNumber} — {w.wardName}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleMutation.mutate(officer._id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        officer.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {officer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add officer modal */}
      {showModal && (
        <AddOfficerModal
          wards={wards}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// ── Add Officer Modal ────────────────────────────────────
const AddOfficerModal = ({ wards, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mutation = useMutation({
    mutationFn: createOfficer,
    onSuccess: () => {
      toast.success('Officer created successfully');
      queryClient.invalidateQueries(['officer-stats']);
      queryClient.invalidateQueries(['ward-stats']);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create officer'),
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lifted">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">Add Ward Officer</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              placeholder="Officer's full name"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="field-error">⚠ {errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="officer@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />
            {errors.email && <p className="field-error">⚠ {errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Temporary password</label>
            <input
              type="text"
              className="input"
              placeholder="Min. 6 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
            />
            {errors.password && <p className="field-error">⚠ {errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Assign ward <span className="text-slate-400 font-normal">(optional)</span></label>
            <select className="input" {...register('wardId')}>
              <option value="">— No ward —</option>
              {wards.map(w => (
                <option key={w._id} value={w._id}>
                  Ward {w.wardNumber} — {w.wardName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Creating...' : 'Create Officer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOfficers;