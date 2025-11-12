// Типы для управления спринтами
export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  project: {
    id: number;
    name: string;
  };
}

export interface CreateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintRequest {
  name: string;
  startDate: string;
  endDate: string;
}
