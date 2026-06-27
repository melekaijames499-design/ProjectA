import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
  } catch (err) {
    return '-';
  }
};

export const formatShortDate = (date) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'MMM d, h:mm a');
  } catch (err) {
    return '-';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (err) {
    return '-';
  }
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return '-';
  return `${parseFloat(val).toFixed(1)}%`;
};

export const formatTemp = (val) => {
  if (val === undefined || val === null) return '-';
  return `${parseFloat(val).toFixed(1)}°C`;
};
