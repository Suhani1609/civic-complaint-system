const ROLE_CONFIG = {
  citizen:      { bg: 'bg-blue-500',   label: '👤', ring: 'ring-blue-200'   },
  ward_officer: { bg: 'bg-violet-500', label: '👮', ring: 'ring-violet-200' },
  admin:        { bg: 'bg-rose-500',   label: '🏛️', ring: 'ring-rose-200'   },
};

const TimelineView = ({ timeline = [] }) => {
  if (!timeline.length) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-slate-400">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {[...timeline].reverse().map((entry, i, arr) => {
        const cfg = ROLE_CONFIG[entry.role] || ROLE_CONFIG.citizen;
        const isLast = i === arr.length - 1;

        return (
          <div key={i} className="flex gap-4 relative">
            {/* Line */}
            {!isLast && (
              <div className="absolute left-[18px] top-9 bottom-0 w-px bg-slate-200" />
            )}

            {/* Dot */}
            <div className={`
              w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
              text-sm z-10 mt-0.5 ring-4 ring-white ${cfg.bg}
            `}>
              {cfg.label}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  {entry.action}
                </p>
                <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5">
                by <span className="font-medium">{entry.performedBy?.name || 'Unknown'}</span>
                {' · '}
                <span className="capitalize">{entry.role?.replace('_', ' ')}</span>
              </p>

              {entry.remark && (
                <div className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 italic">
                  "{entry.remark}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineView;