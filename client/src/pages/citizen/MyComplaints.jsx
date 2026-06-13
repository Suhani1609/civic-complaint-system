import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getComplaints } from '../../api/complaints';
import useDebounce from '../../hooks/useDebounce';
import ComplaintCard from '../../components/complaint/ComplaintCard';
import SkeletonCard from '../../components/ui/SkeletonCard';
import EmptyState from '../../components/ui/EmptyState';
import { CATEGORIES } from '../../utils/constants';

const STATUSES = ['pending','assigned','in_progress','resolved','closed','reopened'];

const MyComplaints = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const debouncedSearch     = useDebounce(search, 300);

  // Read filters from URL
  const status   = searchParams.get('status')   || '';
  const category = searchParams.get('category') || '';
  const page     = parseInt(searchParams.get('page') || '1');

  const setParam = (key, val) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (val) next.set(key, val);
      else next.delete(key);
      next.set('page', '1'); // reset page on filter change
      return next;
    });
  };

  const setPage = (p) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', p.toString());
      return next;
    });
  };

  const clearFilters = () => setSearchParams({});

  const { data, isLoading } = useQuery({
    queryKey: ['my-complaints', status, category, debouncedSearch, page],
    queryFn:  () => getComplaints({
      status, category,
      search: debouncedSearch,
      page, limit: 10,
    }),
  });

  const complaints  = data?.complaints || [];
  const pagination  = data?.pagination  || {};
  const hasFilters  = status || category || debouncedSearch;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">My Complaints</h1>
        <Link to="/new-complaint" className="btn-primary text-sm">
          + New
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
          🔍
        </span>
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by title or description..."
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

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap">
        {/* Status filter */}
        <select
          className="input w-auto text-sm"
          value={status}
          onChange={e => setParam('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          className="input w-auto text-sm"
          value={category}
          onChange={e => setParam('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="btn-secondary text-sm text-red-500 border-red-200 hover:bg-red-50"
          >
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Result count */}
      {!isLoading && (
        <p className="text-sm text-slate-500">
          {pagination.total > 0
            ? `${pagination.total} complaint${pagination.total !== 1 ? 's' : ''} found`
            : 'No complaints found'
          }
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={hasFilters ? '🔍' : '📭'}
          title={hasFilters ? 'No results found' : 'No complaints yet'}
          description={
            hasFilters
              ? 'Try adjusting your search or filters'
              : 'File your first complaint to get started'
          }
          action={
            !hasFilters && (
              <Link to="/new-complaint" className="btn-primary text-sm">
                File a Complaint
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <ComplaintCard key={c._id} complaint={c} linkPrefix="/complaints" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ← Prev
          </button>

          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  page === i + 1
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={!pagination.hasNext}
            onClick={() => setPage(page + 1)}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;