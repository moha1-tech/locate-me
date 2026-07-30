import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { acceptInvite, getMyCircles, getPendingInvites } from '../api/circles';
import { Circle, PendingInvite } from '../types';
import { useAuth } from './AuthContext';

interface CircleContextValue {
  circles: Circle[];
  activeCircle: Circle | null;
  pendingInvites: PendingInvite[];
  loading: boolean;
  setActiveCircleId: (id: string) => void;
  refetch: () => Promise<void>;
  accept: (circleId: string) => Promise<void>;
}

const CircleContext = createContext<CircleContextValue | undefined>(undefined);

export function CircleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (user?.role !== 'CAREGIVER') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [data, invites] = await Promise.all([getMyCircles(), getPendingInvites()]);
      setCircles(data);
      setPendingInvites(invites);
      setActiveCircleId((current) => current ?? data[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  };

  const accept = async (circleId: string) => {
    await acceptInvite(circleId);
    await refetch();
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value = useMemo<CircleContextValue>(
    () => ({
      circles,
      activeCircle: circles.find((c) => c.id === activeCircleId) ?? null,
      pendingInvites,
      loading,
      setActiveCircleId,
      refetch,
      accept,
    }),
    [circles, pendingInvites, activeCircleId, loading],
  );

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircle() {
  const ctx = useContext(CircleContext);
  if (!ctx) {
    throw new Error('useCircle must be used within a CircleProvider');
  }
  return ctx;
}
