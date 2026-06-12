const ROLE_COLORS = {
  citizen:      'bg-blue-500',
  ward_officer: 'bg-purple-500',
  admin:        'bg-red-500',
};

const TimelineView = ({ timeline = [] }) => {
  if (timeline.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No timeline entries yet</p>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-4">
        {[...timeline].reverse().map((entry, i) => (
          <div key={i} className="flex gap-4 relative">
            {/* Dot */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium z-10 ${ROLE_COLORS[entry.role] || 'bg-gray-400'}`}>
              {entry.role === 'citizen' ? '👤' : entry.role === 'ward_officer' ? '👮' : '🏛️'}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {new Date(entry.timestamp).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-0.5 capitalize">
                by {entry.performedBy?.name || 'Unknown'} · {entry.role?.replace('_', ' ')}
              </p>

              {entry.remark && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  "{entry.remark}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;