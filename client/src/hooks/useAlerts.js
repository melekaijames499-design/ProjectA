import { useState, useEffect, useContext } from 'react';
import { getAlerts, resolveAlert } from '../api/alert.api';
import { SocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useAlerts = (farmId) => {
  const socket = useContext(SocketContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getAlerts(id, { isResolved: 'all', severity: 'all' });
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to load alerts list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
      // Update locally
      setAlerts(prev => prev.map(a => 
        a._id === alertId 
          ? { ...a, isResolved: true, resolvedAt: new Date() } 
          : a
      ));
      toast.success('Alert resolved');
    } catch (err) {
      toast.error('Failed to resolve alert');
    }
  };

  useEffect(() => {
    if (!farmId) return;
    
    fetchAlerts(farmId);

    if (!socket) return;

    const handleNewAlert = (data) => {
      if (data.farmId.toString() === farmId.toString()) {
        setAlerts(prev => [data.alert, ...prev]);
      }
    };

    const handleAlertResolvedStatus = (data) => {
      if (data.farmId.toString() === farmId.toString()) {
        setAlerts(prev => prev.map(a => 
          a._id === data.alertId 
            ? { ...a, isResolved: true, resolvedAt: new Date() } 
            : a
        ));
      }
    };

    socket.on('new_alert', handleNewAlert);
    socket.on('alert_resolved', handleAlertResolvedStatus);

    return () => {
      socket.off('new_alert', handleNewAlert);
      socket.off('alert_resolved', handleAlertResolvedStatus);
    };
  }, [farmId, socket]);

  return {
    alerts,
    loading,
    resolve: handleResolve,
    refresh: () => fetchAlerts(farmId)
  };
};

export default useAlerts;
