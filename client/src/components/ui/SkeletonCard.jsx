const SkeletonCard = () => (
  <div className="card p-5 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;