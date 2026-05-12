export const ROLES = {
  CITIZEN: 'citizen',
  WARD_OFFICER: 'ward_officer',
  ADMIN: 'admin',
};

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  CITIZEN_DASHBOARD: '/dashboard',
  CITIZEN_COMPLAINTS: '/my-complaints',
  NEW_COMPLAINT: '/new-complaint',
  OFFICER_DASHBOARD: '/officer',
  OFFICER_COMPLAINTS: '/officer/complaints',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_OFFICERS: '/admin/officers',
  ADMIN_WARDS: '/admin/wards',
};

export const STATUSES = {
  pending:     { label: 'Pending',     bg: 'bg-amber-100',  text: 'text-amber-800'  },
  assigned:    { label: 'Assigned',    bg: 'bg-blue-100',   text: 'text-blue-800'   },
  in_progress: { label: 'In Progress', bg: 'bg-purple-100', text: 'text-purple-800' },
  resolved:    { label: 'Resolved',    bg: 'bg-green-100',  text: 'text-green-800'  },
  closed:      { label: 'Closed',      bg: 'bg-gray-100',   text: 'text-gray-500'   },
  reopened:    { label: 'Reopened',    bg: 'bg-red-100',    text: 'text-red-800'    },
};

export const CATEGORIES = [
  { value: 'electricity', label: 'Electricity',   icon: '⚡' },
  { value: 'water',       label: 'Water Supply',  icon: '💧' },
  { value: 'garbage',     label: 'Garbage',       icon: '🗑️' },
  { value: 'road',        label: 'Road Damage',   icon: '🛣️' },
  { value: 'drainage',    label: 'Drainage',      icon: '🌊' },
  { value: 'lights',      label: 'Street Lights', icon: '🔦' },
  { value: 'gas',         label: 'Gas',           icon: '🔥' },
  { value: 'hygiene',     label: 'Hygiene',       icon: '🧹' },
  { value: 'other',       label: 'Other',         icon: '📋' },
];