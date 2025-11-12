// Сервис для работы с localStorage
export class StorageService {
  private static readonly TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly ROLES_KEY = 'roles';
  private static readonly PROJECT_KEY = 'selectedProject';

  // Токены
  static setTokens(accessToken: string, refreshToken: string, roles: string[] = []): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static getRoles(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const roles = localStorage.getItem(this.ROLES_KEY);
      return roles ? JSON.parse(roles) : [];
    } catch {
      return [];
    }
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLES_KEY);
  }

  // Проект
  static setSelectedProject(project: unknown): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.PROJECT_KEY, JSON.stringify(project));
  }

  static getSelectedProject(): unknown {
    if (typeof window === 'undefined') return null;
    try {
      const project = localStorage.getItem(this.PROJECT_KEY);
      return project ? JSON.parse(project) : null;
    } catch {
      return null;
    }
  }

  static clearSelectedProject(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.PROJECT_KEY);
  }

  // Общая очистка
  static clearAll(): void {
    this.clearTokens();
    this.clearSelectedProject();
  }
}
