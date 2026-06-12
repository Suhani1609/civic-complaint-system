const PRIORITIES = {
  low:      { label: 'Low',      bg: 'bg-gray-100',   text: 'text-gray-600'  },
  medium:   { label: 'Medium',   bg: 'bg-blue-100',   text: 'text-blue-700'  },
  high:     { label: 'High',     bg: 'bg-amber-100',  text: 'text-amber-700' },
  critical: { label: 'Critical', bg: 'bg-red-100',    text: 'text-red-700'   },
};

const PriorityBadge = ({ priority }) => {
  const config = PRIORITIES[priority] || PRIORITIES.medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default PriorityBadge;