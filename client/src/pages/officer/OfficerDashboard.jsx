import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '../../api/complaints';
import StatCard from '../../components/ui/StatCard';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';

const OfficerDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['officer-complaints'],
    queryFn:  () => getComplaints({ limit: 5 }),
  });

  const complaints = data?.complaints || [];
  const total      = data?.pagination?.total || 0;

  const pending    = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in_progress').length;
  const resolved   = complaints.filter(c => ['resolved','closed'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Officer Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage complaints assigned to your ward</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Assigned" value={total}      icon="📋" color="primary" />
        <StatCard label="Pending"        value={pending}    icon="⏳" color="amber"   />
        <StatCard label="In Progress"    value={inProgress} icon="🔄" color="blue"    />
        <StatCard label="Resolved"       value={resolved}   icon="✅" color="green"   />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Complaints</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState icon="✅" title="No complaints assigned" description="You are all caught up!" />
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <ComplaintCard key={c._id} complaint={c} linkPrefix="/officer/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;