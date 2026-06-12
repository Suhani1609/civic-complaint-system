import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { CATEGORIES } from '../../utils/constants';

const ComplaintCard = ({ complaint, linkPrefix = '/complaints' }) => {
  const category = CATEGORIES.find(c => c.value === complaint.category);

  return (
    <Link
      to={`${linkPrefix}/${complaint._id}`}
      className="card p-4 flex items-start gap-3 hover:shadow-md transition-shadow duration-150 block"
    >
      {/* Category icon */}
      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
        {category?.icon || '📋'}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">{complaint.title}</h3>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs text-gray-400">
            🗺️ {complaint.ward?.wardName || 'Unknown ward'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ComplaintCard;