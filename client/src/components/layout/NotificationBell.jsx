import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from '../../api/notifications';
import { useAuthStore } from '../../store/authStore';
import { getSocket, connectSocket } from '../../utils/socket';

const TYPE_ICON = {
  complaint_created:   '📋',
  status_changed:      '🔄',
  complaint_assigned:  '📌',
  complaint_resolved:  '✅',
  complaint_reopened:  '🔄',
  feedback_received:   '⭐',
};

const NotificationBell = () => {
  const { user }       = useAuthStore();
  const queryClient    = useQueryClient();
  const navigate       = useNavigate();
  const [open, setOpen]= useState(false);
  const ref            = useRef(null);

  // ── Queries ────────────────────────────────────────────
  const { data: countData } = useQuery({
    queryKey: ['unread-count'],
    queryFn:  getUnreadCount,
    refetchInterval: 30000, // fallback poll every 30s
  });

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn:  getNotifications,
    enabled:  open, // only fetch when dropdown is open
  });

  const unreadCount   = countData?.count || 0;
  const notifications = notifData?.notifications || [];

  // ── Mutations ─────────────────────────────────────────
  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess:  () => {
      queryClient.invalidateQueries(['unread-count']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess:  () => {
      queryClient.invalidateQueries(['unread-count']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  // ── Socket.io real-time ───────────────────────────────
  useEffect(() => {
    if (!user?._id) return;

    connectSocket(user._id);
    const socket = getSocket();

    socket.on('new_notification', () => {
      // Increment count and refresh list if dropdown is open
      queryClient.invalidateQueries(['unread-count']);
      queryClient.invalidateQueries(['notifications']);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [user?._id, queryClient]);

  // ── Close on outside click ────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ──────────────────────────────────────────
  const handleClick = (notif) => {
    if (!notif.isRead) readMutation.mutate(notif._id);
    if (notif.relatedComplaint) {
      const base = user.role === 'ward_officer' ? '/officer/complaints'
                 : user.role === 'admin'        ? '/admin/complaints'
                 :                                '/complaints';
      navigate(`${base}/${notif.relatedComplaint._id || notif.relatedComplaint}`);
    }
    setOpen(false);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-lifted z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-400">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-violet-600 font-semibold hover:text-violet-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔕</p>
                <p className="text-sm text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif._id}
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0 ${
                    !notif.isRead ? 'bg-violet-50/40' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${
                    !notif.isRead ? 'bg-violet-100' : 'bg-slate-100'
                  }`}>
                    {TYPE_ICON[notif.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug mb-0.5 ${
                      !notif.isRead
                        ? 'font-semibold text-slate-900'
                        : 'font-medium text-slate-700'
                    }`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400 text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;