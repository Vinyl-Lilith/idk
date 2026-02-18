import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:10000';

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, { auth: { token } });

    // Named handlers so they can be properly removed on cleanup
    const onConnect = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };
    const onDisconnect = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    };
    const onConnectError = (error) => {
      console.error('WebSocket error:', error);
    };
    const onThresholdUpdate = (data) => {
      toast.success(`Thresholds updated by ${data.updatedBy}`);
    };
    const onManualControl = (data) => {
      toast(`${data.actuator} ${data.state ? 'ON' : 'OFF'} by ${data.controlledBy}`, { icon: '🔧' });
    };
    const onAutoModeResumed = (data) => {
      toast.success(`Automation resumed by ${data.resumedBy}`);
    };
    const onSystemAlert = (alert) => {
      if (alert.level === 'CRITICAL') {
        toast.error(alert.message, { duration: 10000 });
      } else if (alert.level === 'ERROR') {
        toast.error(alert.message);
      } else if (alert.level === 'WARNING') {
        toast(alert.message, { icon: '⚠️' });
      }
    };
    const onForceDisconnect = (data) => {
      toast.error(data.reason);
      localStorage.removeItem('token');
      window.location.href = '/login';
    };

    newSocket.on('connect', onConnect);
    newSocket.on('disconnect', onDisconnect);
    newSocket.on('connect_error', onConnectError);
    newSocket.on('threshold_update', onThresholdUpdate);
    newSocket.on('manual_control', onManualControl);
    newSocket.on('auto_mode_resumed', onAutoModeResumed);
    newSocket.on('system_alert', onSystemAlert);
    newSocket.on('force_disconnect', onForceDisconnect);

    setSocket(newSocket);

    return () => {
      newSocket.off('connect', onConnect);
      newSocket.off('disconnect', onDisconnect);
      newSocket.off('connect_error', onConnectError);
      newSocket.off('threshold_update', onThresholdUpdate);
      newSocket.off('manual_control', onManualControl);
      newSocket.off('auto_mode_resumed', onAutoModeResumed);
      newSocket.off('system_alert', onSystemAlert);
      newSocket.off('force_disconnect', onForceDisconnect);
      newSocket.close();
    };
  }, [token]);

  const value = { socket, connected };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
