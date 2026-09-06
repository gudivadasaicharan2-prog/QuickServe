import fetchApi from './fetchApi';

export async function fetchNotifications() {
  return fetchApi('/api/notifications');
}

export async function fetchUnreadCount() {
  const result = await fetchApi('/api/notifications/unread-count');
  return result?.count || 0;
}

export async function markNotificationRead(id) {
  return fetchApi(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return fetchApi('/api/notifications/read-all', { method: 'PATCH' });
}
