export const ROLES = {
  ADMIN: 'admin',
  FARMER: 'farmer',
  VIEWER: 'viewer'
};

export const ALERT_TYPES = {
  LOW_MOISTURE: 'low_moisture',
  HIGH_MOISTURE: 'high_moisture',
  HIGH_TEMP: 'high_temp',
  LOW_HUMIDITY: 'low_humidity',
  PUMP_FAULT: 'pump_fault',
  CONNECTIVITY: 'connectivity'
};

export const ALERT_LABELS = {
  low_moisture: 'Low Moisture',
  high_moisture: 'High Moisture',
  high_temp: 'High Temperature',
  low_humidity: 'Low Humidity',
  pump_fault: 'Pump Fault',
  connectivity: 'Connectivity Offline'
};

export const SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

export const CHART_COLORS = {
  MOISTURE: '#3B82F6', // Blue
  TEMPERATURE: '#EF4444', // Red
  HUMIDITY: '#10B981', // Emerald Green
  PUMP: '#F59E0B' // Amber
};
