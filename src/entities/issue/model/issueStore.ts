import { create } from 'zustand';
import { Issue } from './types';

interface IssueStore {
  issues: Issue[];
  selectedIssue: Issue | null;
  setIssues: (issues: Issue[]) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (issue: Issue) => void;
  removeIssue: (issueId: number) => void;
}

export const useIssueStore = create<IssueStore>((set) => ({
  issues: [],
  selectedIssue: null,
  setIssues: (issues) => set({ issues }),
  setSelectedIssue: (selectedIssue) => set({ selectedIssue }),
  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  updateIssue: (issue) => set((state) => ({
    issues: state.issues.map(i => i.id === issue.id ? issue : i)
  })),
  removeIssue: (issueId) => set((state) => ({
    issues: state.issues.filter(i => i.id !== issueId)
  })),
}));