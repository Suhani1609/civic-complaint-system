import { STATUSES } from '../../utils/constants';

const StatusBadge = ({ status }) => {
  const config = STATUSES[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;