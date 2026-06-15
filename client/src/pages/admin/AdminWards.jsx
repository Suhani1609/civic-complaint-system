import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getWardStats, assignOfficerToWard } from '../../api/complaints';
import api from '../../api/axios';
import SkeletonCard from '../../components/ui/SkeletonCard';

const AdminWards = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ward-stats'],
    queryFn:  getWardStats,
  });

  const { data: officersData } = useQuery({
    queryKey: ['officers'],
    queryFn:  async () => (await api.get('/users?role=ward_officer')).data,
  });

  const assignMutation = useMutation({
    mutationFn: ({ wardId, officerId }) => assignOfficerToWard(wardId, officerId),
    onSuccess: () => {
      toast.success('Ward updated');
      queryClient.invalidateQueries(['ward-stats']);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update'),
  });

  const wards    = data?.wards || [];
  const officers = officersData?.users || [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Wards</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage ward assignments and view performance
        </p>
      </div>

      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Wards</p>
            <p className="text-2xl font-bold text-slate-900">{wards.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Assigned</p>
            <p className="text-2xl font-bold text-emerald-600">
              {wards.filter(w => w.assignedOfficer).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Unassigned</p>
            <p className="text-2xl font-bold text-amber-600">
              {wards.filter(w => !w.assignedOfficer).length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Avg Resolution</p>
            <p className="text-2xl font-bold text-violet-600">
              {wards.length > 0
                ? Math.round(wards.reduce((sum, w) => sum + w.resolutionRate, 0) / wards.length)
                : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Wards table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Ward</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Officer</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Total</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Pending</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Resolved</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase px-5 py-3">Rate</th>
                </tr>
              </thead>
              <tbody>
                {wards.map(ward => (
                  <tr key={ward._id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">
                        Ward {ward.wardNumber}
                      </p>
                      <p className="text-xs text-slate-400">{ward.wardName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        className="input text-xs w-auto py-1.5"
                        value={ward.assignedOfficer?._id || ''}
                        onChange={e => assignMutation.mutate({
                          wardId: ward._id,
                          officerId: e.target.value || null,
                        })}
                      >
                        <option value="">— Unassigned —</option>
                        {officers.map(o => (
                          <option key={o._id} value={o._id}>{o.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm font-semibold text-slate-700">
                      {ward.total}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-amber-600">{ward.pending}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-emerald-600">{ward.resolved}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${ward.resolutionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 w-9">
                          {ward.resolutionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {wards.map(ward => (
              <div key={ward._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Ward {ward.wardNumber} — {ward.wardName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {ward.total} complaints · {ward.resolutionRate}% resolved
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-600 font-semibold">{ward.pending} pending</p>
                    <p className="text-xs text-emerald-600 font-semibold">{ward.resolved} resolved</p>
                  </div>
                </div>

                <select
                  className="input text-sm w-full"
                  value={ward.assignedOfficer?._id || ''}
                  onChange={e => assignMutation.mutate({
                    wardId: ward._id,
                    officerId: e.target.value || null,
                  })}
                >
                  <option value="">— Unassigned —</option>
                  {officers.map(o => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${ward.resolutionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWards;