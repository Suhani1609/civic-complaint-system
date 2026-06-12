const SkeletonCard = () => (
  <div className="card p-4">
    <div className="flex items-start gap-3 animate-pulse">
      <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="flex items-center justify-between gap-4">
          <div className="skeleton h-4 w-2/3 rounded-lg" />
          <div className="skeleton h-5 w-16 rounded-lg" />
        </div>
        <div className="skeleton h-3 w-full rounded-lg" />
        <div className="skeleton h-3 w-4/5 rounded-lg" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-4 w-14 rounded-lg" />
          <div className="skeleton h-4 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export default SkeletonCard;