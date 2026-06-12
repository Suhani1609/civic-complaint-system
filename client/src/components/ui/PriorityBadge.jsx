const CONFIG = {
  low:      { label: 'Low',      dot: 'bg-slate-400',   cls: 'text-slate-600'  },
  medium:   { label: 'Medium',   dot: 'bg-blue-500',    cls: 'text-blue-700'   },
  high:     { label: 'High',     dot: 'bg-amber-500',   cls: 'text-amber-700'  },
  critical: { label: 'Critical', dot: 'bg-red-500',     cls: 'text-red-700'    },
};

const PriorityBadge = ({ priority }) => {
  const c = CONFIG[priority] || CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

export default PriorityBadge;