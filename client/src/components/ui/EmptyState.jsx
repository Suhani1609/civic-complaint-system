const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;