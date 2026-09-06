import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  ClipboardList,
  MessageSquare,
  CheckCheck,
  Check,
  Receipt,
  GlassWater,
  Sparkles,
} from 'lucide-react';
import './NotificationBell.css';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getNotificationIcon(notification) {
  if (notification.type === 'ORDER') {
    return <ClipboardList size={16} />;
  }
  const title = (notification.title || '').toLowerCase();
  if (title.includes('bill')) return <Receipt size={16} />;
  if (title.includes('water')) return <GlassWater size={16} />;
  return <MessageSquare size={16} />;
}

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleOpen,
    closeDropdown,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, closeDropdown]);

  const handleItemClick = async (notif) => {
    if (!notif.readStatus) {
      await markAsRead(notif.id);
    }
    closeDropdown();
    if (notif.type === 'ORDER') {
      navigate('/orders');
    } else {
      navigate('/requests');
    }
  };

  return (
    <div className="notif-bell-container" ref={dropdownRef}>
      <button
        className="btn-icon notif-bell-btn"
        onClick={toggleOpen}
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown card">
          <div className="notif-dropdown__header">
            <div className="notif-dropdown__title-wrap">
              <span className="notif-dropdown__title">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="notif-dropdown__list">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.readStatus ? 'notif-item--unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div className={`notif-item__icon notif-icon--${n.type ? n.type.toLowerCase() : 'request'}`}>
                    {getNotificationIcon(n)}
                  </div>
                  <div className="notif-item__content">
                    <div className="notif-item__top">
                      <span className="notif-item__title">{n.title}</span>
                      <span className="notif-item__time">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    {n.message && (
                      <p className="notif-item__message">{n.message}</p>
                    )}
                  </div>
                  {!n.readStatus && (
                    <span className="notif-item__dot" title="Unread" />
                  )}
                </div>
              ))
            ) : (
              <div className="notif-empty">
                <Sparkles size={28} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No notifications yet</p>
                <span>You're all caught up!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
