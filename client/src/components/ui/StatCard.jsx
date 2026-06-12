const VARIANTS = {
  primary: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-700' },
  green:   { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
  amber:   { bg: 'bg-amber-50',  icon: 'bg-amber-100  text-amber-600',  val: 'text-amber-700'  },
  red:     { bg: 'bg-red-50',    icon: 'bg-red-100    text-red-600',    val: 'text-red-700'    },
  blue:    { bg: 'bg-blue-50',   icon: 'bg-blue-100   text-blue-600',   val: 'text-blue-700'   },
  purple:  { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700' },
};

const StatCard = ({ label, value, icon, color = 'primary' }) => {
  const v = VARIANTS[color] || VARIANTS.primary;
  return (
    <div className={`rounded-2xl p-5 border border-white/60 shadow-sm ${v.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
          <p className={`text-3xl font-bold ${v.val}`}>{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${v.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;