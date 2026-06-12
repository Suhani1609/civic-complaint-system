import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplaints, assignComplaint } from '../../api/complaints';
import api from '../../api/axios';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [status,   setStatus]   = useState('');
  const [category, setCategory] = useState('');
  const [page,     setPage]     = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-complaints', status, category, page],
    queryFn:  () => getComplaints({ status, category, page, limit: 10 }),
  });

  const { data: officersData } = useQuery({
    queryKey: ['officers'],
    queryFn:  async () => (await api.get('/users?role=ward_officer')).data,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, officerId }) => assignComplaint(id, officerId),
    onSuccess: () => {
      toast.success('Complaint assigned');
      queryClient.invalidateQueries(['admin-complaints']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to assign'),
  });

  const complaints = data?.complaints || [];
  const pagination = data?.pagination || {};
  const officers   = officersData?.users || [];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">All Complaints</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          className="input w-auto text-sm"
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {['pending','assigned','in_progress','resolved','closed','reopened'].map(s => (
            <option key={s} value={s}>{s.replace('_',' ')}</option>
          ))}
        </select>

        <select
          className="input w-auto text-sm"
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {['electricity','water','garbage','road','drainage','lights','gas','hygiene','other'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState icon="📭" title="No complaints found" />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c._id} className="space-y-2">
              <ComplaintCard complaint={c} linkPrefix="/admin/complaints" />
              {/* Quick assign for pending complaints */}
              {c.status === 'pending' && officers.length > 0 && (
                <div className="flex items-center gap-2 px-2">
                  <select
                    className="input text-xs w-auto"
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) {
                        assignMutation.mutate({ id: c._id, officerId: e.target.value });
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Assign to officer...</option>
                    {officers.map(o => (
                      <option key={o._id} value={o._id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {pagination.totalPages}</span>
          <button disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;