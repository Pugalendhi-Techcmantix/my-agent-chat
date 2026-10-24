/**
 * Generates a unique ID with an optional prefix
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Formats a timestamp into a readable time string (e.g. "2:45 PM")
 */
export function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats a timestamp into relative or calendar dates
 */
export function formatChatGroupDate(timestamp) {
  if (!timestamp) return 'Recent';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'Previous 7 days';
  if (diffDays < 30) return 'Previous 30 days';

  return date.toLocaleDateString([], { month: 'short', year: 'numeric' });
}

/**
 * Truncates a string with an ellipsis if it exceeds maxLength
 */
export function truncate(str, maxLength = 32) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + '...';
}
