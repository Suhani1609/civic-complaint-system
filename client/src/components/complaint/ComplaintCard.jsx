import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import { CATEGORIES } from '../../utils/constants';

const ComplaintCard = ({ complaint, linkPrefix = '/complaints' }) => {
  const category = CATEGORIES.find(c => c.value === complaint.category);
  const date = new Date(complaint.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Link
      to={`${linkPrefix}/${complaint._id}`}
      className="card-hover p-4 flex items-start gap-4 block group"
    >
      {/* Icon */}
      <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-violet-100 transition-colors">
        {category?.icon || '📋'}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-sm font-semibold text-slate-900 truncate leading-snug">
            {complaint.title}
          </h3>
          <StatusBadge status={complaint.status} />
        </div>

        <p className="text-xs text-slate-500 line-clamp-1 mb-2.5">
          {complaint.description}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <PriorityBadge priority={complaint.priority} />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            🗺️ {complaint.ward?.wardName || 'Unknown ward'}
          </span>
          <span className="text-xs text-slate-400">{date}</span>
        </div>
      </div>

      {/* Arrow */}
      <div className="text-slate-300 group-hover:text-violet-400 transition-colors mt-1 flex-shrink-0 text-sm">
        →
      </div>
    </Link>
  );
};

export default ComplaintCard;