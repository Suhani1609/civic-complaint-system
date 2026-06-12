const CONFIG = {
  pending:     { label: 'Pending',     cls: 'bg-amber-100  text-amber-700  ring-amber-200'  },
  assigned:    { label: 'Assigned',    cls: 'bg-blue-100   text-blue-700   ring-blue-200'   },
  in_progress: { label: 'In Progress', cls: 'bg-violet-100 text-violet-700 ring-violet-200' },
  resolved:    { label: 'Resolved',    cls: 'bg-emerald-100 text-emerald-700 ring-emerald-200'},
  closed:      { label: 'Closed',      cls: 'bg-slate-100  text-slate-600  ring-slate-200'  },
  reopened:    { label: 'Reopened',    cls: 'bg-red-100    text-red-700    ring-red-200'    },
};

const StatusBadge = ({ status }) => {
  const c = CONFIG[status] || { label: status, cls: 'bg-slate-100 text-slate-600 ring-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset ${c.cls}`}>
      {c.label}
    </span>
  );
};

export default StatusBadge;