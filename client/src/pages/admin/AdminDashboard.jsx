import { useQuery } from '@tanstack/react-query';
import {
  getOverview,
  getByCategory,
  getByStatus,
  getMonthly,
} from '../../api/analytics';
import StatCard from '../../components/ui/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const COLORS = ['#7c3aed','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lifted px-3 py-2">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-sm font-bold text-violet-600">{payload[0].value}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: overview }   = useQuery({ queryKey: ['analytics-overview'],  queryFn: getOverview   });
  const { data: byCategory } = useQuery({ queryKey: ['analytics-category'],  queryFn: getByCategory });
  const { data: byStatus }   = useQuery({ queryKey: ['analytics-status'],    queryFn: getByStatus   });
  const { data: monthly }    = useQuery({ queryKey: ['analytics-monthly'],   queryFn: getMonthly    });

  const s = overview?.data || {};

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          System-wide overview and analytics
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={s.total}      icon="📋" color="primary" />
        <StatCard label="Pending"          value={s.pending}    icon="⏳" color="amber"   />
        <StatCard label="In Progress"      value={s.inProgress} icon="🔄" color="blue"    />
        <StatCard label="Resolved"         value={s.resolved}   icon="✅" color="green"   />
        <StatCard label="Citizens"         value={s.totalUsers} icon="👥" color="purple"  />
        <StatCard label="Wards"            value={s.totalWards} icon="🗺️" color="blue"    />
        <StatCard label="Assigned"         value={s.assigned}   icon="📌" color="primary" />
        <StatCard label="Closed"           value={s.closed}     icon="🔒" color="primary" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bar chart */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Complaints by Category</h2>
          <p className="text-xs text-slate-400 mb-4">Total complaints per category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={byCategory?.data || []}
              margin={{ top: 0, right: 0, left: -28, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Status Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Current complaint status breakdown</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byStatus?.data || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {(byStatus?.data || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [val, name]}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
            {(byStatus?.data || []).map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-500 capitalize">{d.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-1">Monthly Trend</h2>
        <p className="text-xs text-slate-400 mb-4">Complaints filed over the past months</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={monthly?.data || []}
            margin={{ top: 5, right: 10, left: -28, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={{ fill: '#7c3aed', r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#7c3aed', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AdminDashboard;