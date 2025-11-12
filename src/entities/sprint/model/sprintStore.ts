import { create } from 'zustand';
import { Sprint } from './types';

interface SprintStore {
  sprints: Sprint[];
  selectedSprint: Sprint | null;
  setSprints: (sprints: Sprint[]) => void;
  setSelectedSprint: (sprint: Sprint | null) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (sprint: Sprint) => void;
  removeSprint: (sprintId: number) => void;
}

export const useSprintStore = create<SprintStore>((set) => ({
  sprints: [],
  selectedSprint: null,
  setSprints: (sprints) => set({ sprints }),
  setSelectedSprint: (selectedSprint) => set({ selectedSprint }),
  addSprint: (sprint) => set((state) => ({ sprints: [...state.sprints, sprint] })),
  updateSprint: (sprint) => set((state) => ({
    sprints: state.sprints.map(s => s.id === sprint.id ? sprint : s)
  })),
  removeSprint: (sprintId) => set((state) => ({
    sprints: state.sprints.filter(s => s.id !== sprintId)
  })),
}));