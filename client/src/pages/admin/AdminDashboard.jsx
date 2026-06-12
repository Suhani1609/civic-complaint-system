import { useQuery } from '@tanstack/react-query';
import {
  getOverview, getByCategory,
  getByStatus, getMonthly,
} from '../../api/analytics';
import StatCard from '../../components/ui/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6'];

const AdminDashboard = () => {
  const { data: overview }  = useQuery({ queryKey: ['analytics-overview'],  queryFn: getOverview  });
  const { data: byCategory }= useQuery({ queryKey: ['analytics-category'],  queryFn: getByCategory});
  const { data: byStatus }  = useQuery({ queryKey: ['analytics-status'],    queryFn: getByStatus  });
  const { data: monthly }   = useQuery({ queryKey: ['analytics-monthly'],   queryFn: getMonthly   });

  const stats = overview?.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide overview and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={stats.total}      icon="📋" color="primary" />
        <StatCard label="Pending"          value={stats.pending}    icon="⏳" color="amber"   />
        <StatCard label="In Progress"      value={stats.inProgress} icon="🔄" color="blue"    />
        <StatCard label="Resolved"         value={stats.resolved}   icon="✅" color="green"   />
        <StatCard label="Total Citizens"   value={stats.totalUsers} icon="👥" color="purple"  />
        <StatCard label="Total Wards"      value={stats.totalWards} icon="🗺️" color="blue"    />
        <StatCard label="Assigned"         value={stats.assigned}   icon="📌" color="primary" />
        <StatCard label="Closed"           value={stats.closed}     icon="🔒" color="primary" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bar chart — by category */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Complaints by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory?.data || []} margin={{ left: -20 }}>
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — by status */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={byStatus?.data || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ status, percent }) =>
                  `${status} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {(byStatus?.data || []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart — monthly */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Monthly Complaints Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly?.data || []} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboard;