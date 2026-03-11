/**
 * PART 1 - W4: Socket.io Multi-Room Architecture
 * Real-time communication with namespace segmentation
 * Usage: import { useSocket } from '@/hooks/useSocket'
 */

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

// Socket.io instance (singleton)
let socket = null;

const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      withCredentials: true,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      }
    });

    // Global connection handlers
    socket.on('connect', () => {
    });

    socket.on('disconnect', () => {
    });

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
  }

  return socket;
};

/**
 * useSocket Hook
 * Manages Socket.io room subscriptions and real-time event handling
 * 
 * Usage:
 * const { emit, on, off } = useSocket({
 *   room: 'student-${userId}',
 *   events: {
 *     'badge-earned': (data) => { /* handle event */ }
 *   }
 * });
 */
export const useSocket = ({ room, events = {} } = {}) => {
  const { user } = useSelector(state => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const [roomsJoined, setRoomsJoined] = useState([]);

  useEffect(() => {
    if (!user || !user.id) return;

    const sock = getSocket();
    
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setRoomsJoined([]);
    };

    sock.on('connect', handleConnect);
    sock.on('disconnect', handleDisconnect);

    // Join specified room
    if (room && !roomsJoined.includes(room)) {
      sock.emit('join-room', { room, userId: user.id });
      setRoomsJoined(prev => [...prev, room]);
    }

    // Register event listeners
    Object.entries(events).forEach(([event, handler]) => {
      sock.on(event, handler);
    });

    return () => {
      if (room && isConnected) {
        sock.emit('leave-room', { room });
      }
      Object.entries(events).forEach(([event]) => {
        sock.off(event);
      });
      sock.off('connect', handleConnect);
      sock.off('disconnect', handleDisconnect);
    };
  }, [user, room, events, isConnected, roomsJoined]);

  const emit = useCallback((event, data) => {
    const sock = getSocket();
    if (sock.connected) {
      sock.emit(event, data);
    } else {
      console.warn('[Socket] Not connected, queuing:', event);
    }
  }, []);

  const on = useCallback((event, handler) => {
    const sock = getSocket();
    sock.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    const sock = getSocket();
    sock.off(event, handler);
  }, []);

  return {
    socket: getSocket(),
    isConnected,
    roomsJoined,
    emit,
    on,
    off
  };
};

export default getSocket;
