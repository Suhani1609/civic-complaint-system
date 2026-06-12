import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '../../api/complaints';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';

const TABS = [
  { label: 'All',         value: ''            },
  { label: 'Assigned',    value: 'assigned'    },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved',    value: 'resolved'    },
];

const OfficerComplaints = () => {
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['officer-complaints', status, page],
    queryFn:  () => getComplaints({ status, page, limit: 10 }),
  });

  const complaints = data?.complaints || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Assigned Complaints</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === tab.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState icon="✅" title="No complaints found" />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/officer/complaints" />
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

export default OfficerComplaints;