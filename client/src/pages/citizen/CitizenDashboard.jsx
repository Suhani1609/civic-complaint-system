import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '../../api/complaints';
import StatCard from '../../components/ui/StatCard';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';

const CitizenDashboard = () => {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => getComplaints({ limit: 5 }),
  });

  const complaints = data?.complaints || [];
  const total      = data?.pagination?.total || 0;

  const counts = {
    total,
    pending:  complaints.filter(c => c.status === 'pending').length,
    active:   complaints.filter(c => ['assigned','in_progress','reopened'].includes(c.status)).length,
    resolved: complaints.filter(c => ['resolved','closed'].includes(c.status)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and manage your civic complaints
          </p>
        </div>
        <Link to="/new-complaint" className="btn-primary text-sm">
          + New Complaint
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Filed"  value={total}           icon="📋" color="primary" />
        <StatCard label="Pending"      value={counts.pending}  icon="⏳" color="amber"   />
        <StatCard label="In Progress"  value={counts.active}   icon="🔄" color="blue"    />
        <StatCard label="Resolved"     value={counts.resolved} icon="✅" color="green"   />
      </div>

      {/* Recent complaints */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Recent Complaints</h2>
          <Link to="/my-complaints" className="text-sm text-primary-600 hover:underline">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No complaints yet"
            description="File your first complaint to get started"
            action={
              <Link to="/new-complaint" className="btn-primary text-sm">
                File a Complaint
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {complaints.map(c => (
              <ComplaintCard key={c._id} complaint={c} linkPrefix="/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;