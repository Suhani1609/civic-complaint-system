import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '../../api/complaints';
import useDebounce from '../../hooks/useDebounce';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import { CATEGORIES } from '../../utils/constants';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];

const OfficerComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debouncedSearch     = useDebounce(search, 300);

  const status   = searchParams.get('status')   || '';
  const priority = searchParams.get('priority') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  const setParam = (key, val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set(key, val);
      else next.delete(key);
      next.set('page', '1');
      return next;
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['officer-complaints', status, priority, debouncedSearch, page],
    queryFn:  () => getComplaints({
      status, priority,
      search: debouncedSearch,
      page, limit: 10,
    }),
  });

  const complaints = data?.complaints || [];
  const pagination = data?.pagination  || {};

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Assigned Complaints</h1>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search complaints..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          className="input w-auto text-sm"
          value={status}
          onChange={e => setParam('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {['assigned','in_progress','resolved','closed'].map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          className="input w-auto text-sm"
          value={priority}
          onChange={e => setParam('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        {(status || priority || debouncedSearch) && (
          <button
            onClick={() => { setSearchParams({}); setSearch(''); }}
            className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-sm text-slate-500">
          {pagination.total ?? complaints.length} complaint{(pagination.total ?? complaints.length) !== 1 ? 's' : ''} found
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState icon="✅" title="No complaints found" description="Try adjusting your filters" />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/officer/complaints" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setParam('page', (page - 1).toString())}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNext}
            onClick={() => setParam('page', (page + 1).toString())}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default OfficerComplaints;