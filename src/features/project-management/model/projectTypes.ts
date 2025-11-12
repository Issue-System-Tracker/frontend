// Типы для управления проектами
export interface Project {
  id: number;
  name: string;
  admin: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };
  members: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface CreateProjectRequest {
  name: string;
}

export interface AddMemberRequest {
  memberEmail: string;
}

export interface ProjectResponse {
  id: number;
  name: string;
  adminEmail: string;
  isAdmin: boolean;
  members: string[]; // Массив email'ов участников
}
