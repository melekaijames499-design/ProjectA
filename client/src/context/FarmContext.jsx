import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFarmDetails, getFarmSummary } from '../api/farm.api';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import toast from 'react-hot-toast';

export const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeFarmId, setActiveFarmId] = useState(null);
  const [farm, setFarm] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set farm automatically from authenticated user profile
  useEffect(() => {
    if (user && user.farmId) {
      setActiveFarmId(user.farmId);
    } else {
      setActiveFarmId(null);
      setFarm(null);
      setThresholds(null);
      setSummary(null);
    }
  }, [user]);

  const fetchFarmData = async (farmId) => {
    if (!farmId) return;
    setLoading(true);
    try {
      const detailsRes = await getFarmDetails(farmId);
      const summaryRes = await getFarmSummary(farmId);
      
      setFarm(detailsRes.data.farm);
      setThresholds(detailsRes.data.thresholds);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Error fetching farm contexts:', err.message);
      toast.error('Failed to load farm details');
    } finally {
      setLoading(false);
    }
  };

  // ── Initial fetch: load farm data whenever activeFarmId changes
  // This is intentionally separate from the socket effect so data loads
  // even before the WebSocket connection is established.
  useEffect(() => {
    if (activeFarmId) {
      fetchFarmData(activeFarmId);
    }
  }, [activeFarmId]);

  // ── Real-time: bind Socket.IO listeners when socket + farm are ready
  useEffect(() => {
    if (!socket || !activeFarmId) return;

    const handleNewReading = (data) => {
      if (data.farmId.toString() === activeFarmId.toString()) {
        setSummary(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            latestReading: data.reading
          };
        });
        toast.success(`New sensor reading: Moisture ${data.reading.soilMoisture}%`, {
          icon: '📊'
        });
      }
    };

    const handlePumpStatusChange = (data) => {
      if (data.farmId.toString() === activeFarmId.toString()) {
        setSummary(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pumpStatus: data.status,
            latestPumpLog: data.log
          };
        });
        const pumpSound = new Audio('/assets/pump_click.mp3');
        pumpSound.play().catch(() => {}); // ignore browser blocking sound errors
        
        toast(`Pump auto-switched: ${data.status}`, {
          icon: data.status === 'ON' ? '🔌' : '🛑',
          duration: 4000
        });
      }
    };

    const handleNewAlert = (data) => {
      if (data.farmId.toString() === activeFarmId.toString()) {
        setSummary(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeAlertsCount: prev.activeAlertsCount + 1
          };
        });
        
        const notificationSound = new Audio('/assets/alert_ping.mp3');
        notificationSound.play().catch(() => {});

        toast.error(`ALERT [${data.alert.severity.toUpperCase()}]: ${data.alert.message}`, {
          duration: 6000
        });
      }
    };

    const handleAlertResolved = (data) => {
      if (data.farmId.toString() === activeFarmId.toString()) {
        setSummary(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            activeAlertsCount: Math.max(0, prev.activeAlertsCount - 1)
          };
        });
        toast.success('System warning cleared');
      }
    };

    // Bind listeners
    socket.on('new_reading', handleNewReading);
    socket.on('pump_status_change', handlePumpStatusChange);
    socket.on('new_alert', handleNewAlert);
    socket.on('alert_resolved', handleAlertResolved);

    // Cleanup listeners
    return () => {
      socket.off('new_reading', handleNewReading);
      socket.off('pump_status_change', handlePumpStatusChange);
      socket.off('new_alert', handleNewAlert);
      socket.off('alert_resolved', handleAlertResolved);
    };
  }, [socket, activeFarmId]);

  return (
    <FarmContext.Provider value={{
      farm,
      thresholds,
      summary,
      loading,
      activeFarmId,
      setActiveFarmId,
      refetchFarmData: () => fetchFarmData(activeFarmId),
      setThresholds
    }}>
      {children}
    </FarmContext.Provider>
  );
};
