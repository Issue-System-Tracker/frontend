import { useUserStore } from "../model/userStore";
import { 
  isUserAuthenticated, 
  hasUserRole, 
  isUserAdmin, 
  getUserDisplayName, 
  getUserEmail 
} from "../utils/userUtils";
import { UserRole } from "../model/types";

/**
 * Хук для работы с пользователем
 */
export function useUser() {
  const { user, setUser, hydrateFromStorage, logout, isAuthenticated, getUserRole: getRole } = useUserStore();

  return {
    user,
    setUser,
    hydrateFromStorage,
    logout,
    isAuthenticated: isAuthenticated(),
    userRole: getRole(),
    isUserAuthenticated: isUserAuthenticated(user),
    hasRole: (role: UserRole) => hasUserRole(user, role),
    isAdmin: isUserAdmin(user),
    displayName: getUserDisplayName(user),
    email: getUserEmail(user),
  };
}
