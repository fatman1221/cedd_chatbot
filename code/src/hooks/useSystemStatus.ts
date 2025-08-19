import { create } from 'zustand';
import type { SystemStatus } from '../types';

interface SystemStatusStore {
  activeUsers: number;
  congestionLevel: SystemStatus['congestionLevel'];
  lastUpdated: Date;
  updateStatus: (status: Partial<SystemStatus>) => void;
}

export const useSystemStatus = create<SystemStatusStore>((set) => ({
  activeUsers: 42,
  congestionLevel: 'low',
  lastUpdated: new Date(),
  updateStatus: (status) => set((state) => ({ ...state, ...status })),
}));