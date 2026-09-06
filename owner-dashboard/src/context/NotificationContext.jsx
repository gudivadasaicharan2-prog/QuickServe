import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken } from '../utils/authService';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../utils/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!getToken()) return;

    try {
      const [list, count] = await Promise.all([
        fetchNotifications().catch(() => null),
        fetchUnreadCount().catch(() => 0),
      ]);

      if (Array.isArray(list)) {
        setNotifications(list);
      }
      if (typeof count === 'number') {
        setUnreadCount(count);
      }
    } catch {
      // Ignore polling errors
    }
  }, []);

  // Polling loop: every 5 seconds when authenticated
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      if (getToken()) {
        loadNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // fallback reload
      loadNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch {
      loadNotifications();
    }
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        toggleOpen,
        closeDropdown,
        markAsRead,
        markAllAsRead,
        refresh: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
